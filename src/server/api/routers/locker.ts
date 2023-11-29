import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { memoryDb } from '~/server/memory-db';
import { LockerStatus } from '~/interfaces/Locker';
import { TRPCError } from '@trpc/server';

export const lockerRouter = createTRPCRouter({
  get: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/locker' } })
    .input(
      z.object({
        type: z.union([z.literal('client'), z.literal('operator')]),
        password: z.string().min(1),
      })
    )
    .output(
      z.object({
        locker: z.object({
          nickname: z.string(),
          loaded: z.boolean(),
          state: z.nativeEnum(LockerStatus),
          isOpen: z.boolean(),
          isEmpty: z.boolean(),
          sizes: z.object({
            height: z.number(),
            width: z.number(),
            depth: z.number(),
          }),
        }),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const reservation = await db.reservation.findFirstOrThrow({
        select: {
          stationId: true,
          lockerId: true,
          loaded: true,
        },
        where:
          input.type === 'client'
            ? {
                clientPassword: input.password,
                expired: false,
                confirmed: true,
                completed: false,
              }
            : {
                operatorPassword: input.password,
                expired: false,
                confirmed: true,
                completed: false,
              },
      });

      const station = memoryDb.stations?.find(({ stationId }) => stationId === reservation.stationId);
      const locker = station?.lockers.find(({ nickname }) => nickname === reservation.lockerId);

      if (!locker) throw new TRPCError({ code: 'NOT_FOUND' });

      return { locker: { ...locker, loaded: reservation.loaded } };
    }),

  open: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/locker/open' } })
    .input(
      z.object({
        type: z.union([z.literal('client'), z.literal('operator')]),
        password: z.string().min(1),
      })
    )
    .output(
      z.object({
        locker: z.object({
          nickname: z.string(),
          state: z.nativeEnum(LockerStatus),
          isOpen: z.boolean(),
          isEmpty: z.boolean(),
          sizes: z.object({
            height: z.number(),
            width: z.number(),
            depth: z.number(),
          }),
        }),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const reservation = await db.reservation.findFirstOrThrow({
        select: {
          id: true,
          stationId: true,
          lockerId: true,
        },
        where:
          input.type === 'client'
            ? {
                clientPassword: input.password,
                expired: false,
                confirmed: true,
                loaded: true,
                completed: false,
              }
            : {
                operatorPassword: input.password,
                expired: false,
                confirmed: true,
                loaded: false,
                completed: false,
              },
      });

      const station = memoryDb.stations?.find(({ stationId }) => stationId === reservation.stationId);
      const locker = station?.lockers.find(({ nickname }) => nickname === reservation.lockerId);

      if (!locker) throw new TRPCError({ code: 'NOT_FOUND' });

      // TODO SEND OPEN
      await db.reservation.update({
        data: {
          loaded: true,
          completed: input.type === 'client',
        },
        where: {
          id: reservation.id,
        },
      });

      return { locker };
    }),
});
