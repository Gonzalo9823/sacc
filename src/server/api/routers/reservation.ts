import { z } from 'zod';
import crypto from 'crypto';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { Mailer } from '~/server/mailer';
import { memoryDb } from '~/server/memory-db';
import { LockerStatus } from '~/interfaces/Locker';
import { TRPCError } from '@trpc/server';
import { UserRole } from '@prisma/client';

export const reservationRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/reservation' } })
    .input(
      z.object({
        stationName: z.string(),
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
          stationName: z.string(),
          lockerId: z.number(),
          status: z.nativeEnum(LockerStatus),
        }),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {
      const station = memoryDb.stations?.find(({ stationName }) => stationName === input.stationName);
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
          loaded: false,
          stationName: input.stationName,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const { expiredReservationIds, availableLockerIds } = station.lockers.reduce<{ expiredReservationIds: number[]; availableLockerIds: number[] }>(
        (lockers, locker) => {
          if (input.height <= locker.sizes.height && input.width <= locker.sizes.width && input.depth <= locker.sizes.depth) {
            const reservation = reservations.find(({ lockerId }) => lockerId === locker.nickname);

            if (reservation) {
              const isReservationExpired = new Date(reservation.createdAt.getTime() + 15 * 60 * 1000).getTime() < new Date().getTime();

              if (isReservationExpired) {
                lockers.expiredReservationIds.push(reservation.id);
                lockers.availableLockerIds.push(locker.nickname);
              }
            } else {
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
          stationName: input.stationName,
          lockerId,
          clientEmail: input.clientEmail,
          operatorEmail: input.operatorEmail,
          confirmed: false,
          expired: false,
          loaded: false,
          completed: false,
          operatorPassword,
          clientPassword,
          createdById: session.user.id,
        },
      });

      return {
        reservation: {
          id: reservation.id,
          stationName: input.stationName,
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
          stationName: z.string(),
          lockerId: z.number(),
          status: z.nativeEnum(LockerStatus),
        }),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {
      const reservation = await db.reservation.findUniqueOrThrow({
        select: {
          id: true,
          stationName: true,
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
          ...(session.user.role === UserRole.ADMIN ? {} : { createdById: session.user.id }),
        },
      });

      await db.reservation.update({
        data: {
          confirmed: true,
        },
        where: {
          id: reservation.id,
        },
      });

      await new Mailer()
        .sendEmail({
          to: session.user.email,
          subject: '¡Reserva Confirmada (Operario)!',
          text: `Se confirmo la reserva en la estación ${reservation.stationName}, locker ${reservation.lockerId} con contraseña ${reservation.operatorPassword}.`,
          html: `<p>Se confirmo la reserva en la estación ${reservation.stationName}, locker ${reservation.lockerId} con contraseña ${reservation.operatorPassword}.</p>`,
        })
        .catch((err) => console.log(err));

      await new Mailer()
        .sendEmail({
          to: reservation.clientEmail,
          subject: '¡Reserva Confirmada (Cliente)!',
          text: `Se confirmo la reserva en la estación ${reservation.stationName}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.`,
          html: `<p>Se confirmo la reserva en la estación ${reservation.stationName}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.</p>`,
        })
        .catch((err) => console.log(err));

      // TODO UPDATE LOCKER TO UPDATED

      return {
        reservation: {
          id: reservation.id,
          stationName: reservation.stationName,
          lockerId: reservation.lockerId,
          status: LockerStatus.CONFIRMED,
        },
      };
    }),
});
