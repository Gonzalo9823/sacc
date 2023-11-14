import { z } from 'zod';
import { UserRole, LockerStatus } from '@prisma/client';
import crypto from 'crypto';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { Mailer } from '~/server/mailer';

export const reservationRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/reservation' } })
    .input(
      z.object({
        stationId: z.number().int().positive(),
        clientEmail: z.string().email(),
        height: z.number().positive(),
        width: z.number().positive(),
      })
    )
    .output(
      z.object({
        reservation: z.object({
          id: z.number(),
          stationId: z.number(),
          lockerId: z.number(),
          status: z.nativeEnum(LockerStatus),
        }),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {
      const station = await db.station.findUniqueOrThrow({
        include: {
          lockers: {
            include: {
              reservations: {
                where: {
                  confirmed: false,
                },
                take: 1,
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
            where: {
              OR: [
                {
                  status: LockerStatus.EMPTY,
                },
                {
                  status: LockerStatus.RESERVED,
                },
              ],
              available: true,
              height: { gte: input.height },
              width: { gte: input.width },
            },
            orderBy: [{ id: 'asc' }, { height: 'asc' }, { width: 'asc' }],
          },
        },
        where: {
          id: input.stationId,
          ...(session.user.role === UserRole.ADMIN
            ? {}
            : {
                allowedForUsers: {
                  some: {
                    userId: session.user.id,
                  },
                },
              }),
        },
      });

      const { expiredLockerIds, expiredReservationIds, availableLockerIds } = station.lockers.reduce<{
        expiredLockerIds: number[];
        expiredReservationIds: number[];
        availableLockerIds: number[];
      }>(
        (lockers, locker) => {
          if (locker.status === LockerStatus.RESERVED) {
            const isReservationExpired = new Date(locker.reservations.at(0)!.createdAt.getTime() + 15 * 60 * 1000).getTime() < new Date().getTime();

            if (isReservationExpired) {
              lockers.expiredLockerIds.push(locker.id);
              lockers.expiredReservationIds.push(locker.reservations.at(0)!.id);
              lockers.availableLockerIds.push(locker.id);
            }
          }

          if (locker.status === LockerStatus.EMPTY) {
            lockers.availableLockerIds.push(locker.id);
          }

          return lockers;
        },
        { expiredLockerIds: [], expiredReservationIds: [], availableLockerIds: [] }
      );

      if (expiredLockerIds.length > 0) {
        await db.locker.updateMany({
          data: {
            status: LockerStatus.EMPTY,
          },
          where: {
            id: {
              in: expiredLockerIds,
            },
          },
        });
      }

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

      const lockerId = availableLockerIds.at(0);

      if (!lockerId) {
        throw new Error('Not available Locker.');
      }

      const operatorPassword = crypto.randomBytes(10).toString('hex');
      const clientPassword = crypto.randomBytes(10).toString('hex');

      try {
        const reservation = await db.$transaction(async (prisma) => {
          await prisma.locker.update({
            data: {
              status: LockerStatus.RESERVED,
            },
            where: {
              id: lockerId,
            },
          });

          const reservation = await prisma.reservation.create({
            include: {
              locker: {
                select: {
                  id: true,
                  height: true,
                  width: true,
                  status: true,
                  available: true,
                },
              },
            },
            data: {
              lockerId,
              reservedById: session.user.id,
              clientEmail: input.clientEmail,
              confirmed: false,
              completed: false,
              expired: false,
              operatorPassword,
              clientPassword,
            },
          });

          return reservation;
        });

        return {
          reservation: {
            id: reservation.id,
            stationId: input.stationId,
            lockerId,
            status: LockerStatus.RESERVED,
          },
        };
      } catch (err) {
        console.log(err);
      }

      throw new Error('There was an error making the reservation.');
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
          stationId: z.number(),
          lockerId: z.number(),
          status: z.nativeEnum(LockerStatus),
        }),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {
      const reservation = await db.reservation.findUniqueOrThrow({
        include: {
          locker: true,
        },
        where: {
          id: input.id,
          confirmed: false,
          completed: false,
          expired: false,
          reservedById: session.user.id,
        },
      });

      try {
        await db.$transaction(async (prisma) => {
          await prisma.locker.update({
            data: {
              status: LockerStatus.CONFIRMED,
            },
            where: {
              id: reservation.lockerId,
            },
          });

          await prisma.reservation.update({
            data: {
              confirmed: true,
            },
            where: {
              id: input.id,
            },
          });
        });

        await new Mailer()
          .sendEmail({
            to: session.user.email,
            subject: '¡Reserva Confirmada (Operario)!',
            text: `Se confirmo la reserva en la estación ${reservation.locker.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.operatorPassword}.`,
            html: `<p>Se confirmo la reserva en la estación ${reservation.locker.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.operatorPassword}.</p>`,
          })
          .catch((err) => console.log(err));

        await new Mailer()
          .sendEmail({
            to: reservation.clientEmail,
            subject: '¡Reserva Confirmada (Cliente)!',
            text: `Se confirmo la reserva en la estación ${reservation.locker.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.`,
            html: `<p>Se confirmo la reserva en la estación ${reservation.locker.stationId}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.</p>`,
          })
          .catch((err) => console.log(err));

        return {
          reservation: {
            id: reservation.id,
            stationId: reservation.locker.stationId,
            lockerId: reservation.lockerId,
            status: LockerStatus.CONFIRMED,
          },
        };
      } catch (err) {
        console.log(err);
      }

      throw new Error('There was an error confirming the reservation.');
    }),
});
