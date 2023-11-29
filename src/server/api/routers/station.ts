import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
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
    .query(() => {
      return {
        stations: memoryDb.stations ?? [],
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
    .query(({ input }) => {
      const station = memoryDb.stations?.find(({ stationName }) => stationName === input.id);

      if (!station) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return { station };
    }),
});
