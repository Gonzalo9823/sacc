import { z } from 'zod';
import crypto from 'crypto';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { Mailer } from '~/server/mailer';
import { memoryDb } from '~/server/memory-db';
import { LockerStatus } from '~/interfaces/Locker';
import { TRPCError } from '@trpc/server';

export const reservationRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/reservation' } })
    .input(
      z.object({
        stationId: z.string(),
        operatorEmail: z.string().email(),
        clientEmail: z.string().email(),
        height: z.number().positive(),
        width: z.number().positive(),
        depth: z.number().positive(),
      })
    )
    .output(
      z.object({
        reservation: z.object({
          id: z.number(),
          stationId: z.string(),
          lockerId: z.string(),
          status: z.nativeEnum(LockerStatus),
        }),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const station = memoryDb.stations?.find(({ stationId }) => stationId === input.stationId);
      if (!station) throw new TRPCError({ code: 'NOT_FOUND' });

      const reservations = await db.reservation.findMany({
        select: {
          id: true,
          lockerId: true,
          createdAt: true,
        },
        where: {
          confirmed: false,
          expired: false,
          stationId: input.stationId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 1,
      });

      const { expiredReservationIds, availableLockerIds } = station.lockers.reduce<{ expiredReservationIds: number[]; availableLockerIds: string[] }>(
        (lockers, locker) => {
          if (input.height <= locker.sizes.height && input.width <= locker.sizes.width && input.depth <= locker.sizes.depth) {
            if (locker.state === LockerStatus.RESERVED) {
              const reservation = reservations.find(({ lockerId }) => lockerId === locker.nickname);

              if (reservation) {
                const isReservationExpired = new Date(reservation.createdAt.getTime() + 15 * 60 * 1000).getTime() < new Date().getTime();

                if (isReservationExpired) {
                  lockers.expiredReservationIds.push(reservation.id);
                  lockers.availableLockerIds.push(locker.nickname);
                }
              }
            }

            if (locker.state === LockerStatus.AVAILABLE) {
              lockers.availableLockerIds.push(locker.nickname);
            }
          }

          return lockers;
        },
        { expiredReservationIds: [], availableLockerIds: [] }
      );

      if (expiredReservationIds.length > 0) {
        await db.reservation.updateMany({
          data: {
            expired: true,
          },
          where: {
            id: {
              in: expiredReservationIds,
            },
          },
        });
      }

      // TODO UPDATE LOCKER STATE

      const lockerId = availableLockerIds.at(0);
      if (!lockerId) throw new TRPCError({ code: 'NOT_FOUND' });

      const operatorPassword = crypto.randomBytes(10).toString('hex');
      const clientPassword = crypto.randomBytes(10).toString('hex');

      const reservation = await db.reservation.create({
        data: {
          stationId: input.stationId,
          lockerId,
          clientEmail: input.clientEmail,
          operatorEmail: input.operatorEmail,
          confirmed: false,
          expired: false,
          completed: false,
          operatorPassword,
          clientPassword,
        },
      });

      return {
        reservation: {
          id: reservation.id,
          stationId: input.stationId,
          lockerId,
          status: LockerStatus.RESERVED,
        },
      };
    }),

  confirm: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/reservation/{id}/confirm' } })
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .output(
      z.object({
        reservation: z.object({
          id: z.number(),
          stationId: z.string(),
          lockerId: z.string(),
          status: z.nativeEnum(LockerStatus),
        }),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {
      const reservation = await db.reservation.findUniqueOrThrow({
        select: {
          id: true,
          stationId: true,
          lockerId: true,
          operatorEmail: true,
          operatorPassword: true,
          clientEmail: true,
          clientPassword: true,
        },
        where: {
          id: input.id,
          confirmed: false,
          completed: false,
          expired: false,
        },
      });

      await db.reservation.update({
        data: {
          confirmed: true,
        },
        where: {
          id: input.id,
        },
      });

      await new Mailer()
        .sendEmail({
          to: session.user.email,
          subject: '¡Reserva Confirmada (Operario)!',
          text: `Se confirmo la reserva en la estación ${reservation.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.operatorPassword}.`,
          html: `<p>Se confirmo la reserva en la estación ${reservation.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.operatorPassword}.</p>`,
        })
        .catch((err) => console.log(err));

      await new Mailer()
        .sendEmail({
          to: reservation.clientEmail,
          subject: '¡Reserva Confirmada (Cliente)!',
          text: `Se confirmo la reserva en la estación ${reservation.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.`,
          html: `<p>Se confirmo la reserva en la estación ${reservation.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.</p>`,
        })
        .catch((err) => console.log(err));

      // TODO UPDATE LOCKER TO UPDATED

      return {
        reservation: {
          id: reservation.id,
          stationId: reservation.stationId,
          lockerId: reservation.lockerId,
          status: LockerStatus.CONFIRMED,
        },
      };
    }),
});
