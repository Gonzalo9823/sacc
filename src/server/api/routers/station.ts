import { z } from 'zod';
import { adminProcedure, createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { memoryDb } from '~/server/memory-db';
import { LockerStatus } from '~/interfaces/Locker';
import { TRPCError } from '@trpc/server';

export const stationRouter = createTRPCRouter({
  getMany: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/stations' } })
    .input(z.void())
    .output(
      z.object({
        stations: z.array(
          z.object({
            stationName: z.string(),
            address: z.string(),
            amountOfConfirmedReservations: z.number(),
            lastConnection: z.date(),
            lockers: z.array(
              z.object({
                nickname: z.number(),
                state: z.nativeEnum(LockerStatus),
                isOpen: z.boolean(),
                isEmpty: z.boolean(),
                sizes: z.object({
                  height: z.number(),
                  width: z.number(),
                  depth: z.number(),
                }),
              })
            ),
          })
        ),
      })
    )
    .query(async ({ ctx: { db } }) => {
      const stations = memoryDb.stations ?? [];
      const stationNames = stations.map(({ stationName }) => stationName);

      const reservations = await db.reservation.findMany({
        select: {
          stationName: true,
        },
        where: {
          stationName: {
            in: stationNames,
          },
          completed: false,
          expired: false,
          confirmed_client: true,
        },
      });

      return {
        stations: stations.map((station) => {
          const stationReservations = reservations.filter(({ stationName }) => stationName === station.stationName);

          return {
            ...station,
            amountOfConfirmedReservations: stationReservations.length,
          };
        }),
      };
    }),

  get: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/stations/{id}' } })
    .input(z.object({ id: z.string() }))
    .output(
      z.object({
        station: z.object({
          stationName: z.string(),
          lockers: z.array(
            z.object({
              nickname: z.number(),
              state: z.nativeEnum(LockerStatus),
              isOpen: z.boolean(),
              isEmpty: z.boolean(),
              sizes: z.object({
                height: z.number(),
                width: z.number(),
                depth: z.number(),
              }),
            })
          ),
        }),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      const station = memoryDb.stations?.find(({ stationName }) => stationName === input.id);

      if (!station) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const reservations = await db.reservation.findMany({
        select: {
          confirmed_client: true,
          confirmed_operator: true,
          loaded: true,
          lockerId: true,
        },
        where: {
          stationName: station.stationName,
          completed: false,
          expired: false,
        },
      });

      return {
        station: {
          ...station,
          lockers: station.lockers.map((locker) => {
            const reservation = reservations.find(({ lockerId }) => lockerId === locker.nickname);

            const state = (() => {
              if (reservation?.loaded) {
                return LockerStatus.USED;
              }

              if (reservation?.confirmed_operator) {
                return LockerStatus.LOADING;
              }

              if (reservation?.confirmed_client === false) {
                return LockerStatus.RESERVED;
              }

              if (reservation?.confirmed_client) {
                return LockerStatus.CONFIRMED;
              }

              return LockerStatus.AVAILABLE;
            })();

            return {
              ...locker,
              state,
            };
          }),
        },
      };
    }),

  getLocker: adminProcedure
    .meta({ openapi: { method: 'GET', path: '/stations/{stationId}/lockers/{lockerId}' } })
    .input(
      z.object({
        stationId: z.string(),
        lockerId: z.coerce.number(),
      })
    )
    .output(
      z.object({
        locker: z.object({
          nickname: z.number(),
          state: z.nativeEnum(LockerStatus),
          isOpen: z.boolean(),
          isEmpty: z.boolean(),
          sizes: z.object({
            height: z.number(),
            width: z.number(),
            depth: z.number(),
          }),
          reservations: z.array(
            z.object({
              id: z.number(),
              clientEmail: z.string(),
              operatorEmail: z.string(),
              confirmedOperator: z.boolean(),
              confirmedOperatorAt: z.date().nullish(),
              confirmedClient: z.boolean(),
              confirmedClientAt: z.date().nullish(),
              loaded: z.boolean(),
              loadedAt: z.date().nullish(),
              expired: z.boolean(),
              completed: z.boolean(),
              completedAt: z.date().nullish(),
              createdAt: z.date(),
              createdBy: z.string(),
            })
          ),
        }),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      const station = memoryDb.stations?.find(({ stationName }) => stationName === input.stationId);
      const locker = station?.lockers.find(({ nickname }) => nickname === input.lockerId);

      if (!locker) throw new TRPCError({ code: 'NOT_FOUND' });

      const reservations = await db.reservation.findMany({
        select: {
          id: true,
          clientEmail: true,
          operatorEmail: true,
          confirmed_operator: true,
          confirmedOperatorAt: true,
          confirmed_client: true,
          confirmedClientAt: true,
          loaded: true,
          loadedAt: true,
          expired: true,
          completed: true,
          completedAt: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        where: {
          lockerId: locker.nickname,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const lastActiveReservation = reservations.find(({ completed, expired }) => completed === false && expired === false);

      const state = (() => {
        if (lastActiveReservation?.loaded) {
          return LockerStatus.USED;
        }

        if (lastActiveReservation?.confirmed_operator) {
          return LockerStatus.LOADING;
        }

        if (lastActiveReservation?.confirmed_client === false) {
          return LockerStatus.RESERVED;
        }

        if (lastActiveReservation?.confirmed_client) {
          return LockerStatus.CONFIRMED;
        }

        return LockerStatus.AVAILABLE;
      })();

      return {
        locker: {
          ...locker,
          state,
          reservations: reservations.map(
            ({
              id,
              clientEmail,
              operatorEmail,
              confirmed_operator,
              confirmedOperatorAt,
              confirmed_client,
              confirmedClientAt,
              loaded,
              loadedAt,
              expired,
              completed,
              completedAt,
              createdBy,
              createdAt,
            }) => ({
              id,
              clientEmail,
              operatorEmail,
              confirmedOperator: confirmed_operator,
              confirmedOperatorAt,
              confirmedClient: confirmed_client,
              confirmedClientAt,
              loaded,
              loadedAt,
              expired,
              completed,
              completedAt,
              createdBy: createdBy.name,
              createdAt,
            })
          ),
        },
      };
    }),
});
