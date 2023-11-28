import { z } from 'zod';
import { LockerStatus } from '@prisma/client';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { memoryDb } from '~/server/memory-db';

export const stationRouter = createTRPCRouter({
  getMany: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/stations' } })
    .input(z.void())
    .output(
      z.object({
        stations: z.array(
          z.object({
            stationId: z.string(),
            lockers: z.array(
              z.object({
                nickname: z.string(),
                state: z.string(),
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
          stationId: z.string(),
          lockers: z.array(
            z.object({
              nickname: z.string(),
              state: z.string(),
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
      const station = memoryDb.stations?.find(({ stationId }) => stationId === input.id);

      if (!station) {
        throw new Error('Not Found.');
      }

      return { station };
    }),

  loadLocker: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/stations/{id}/{lockerId}/load' } })
    .input(
      z.object({
        id: z.string(),
        lockerId: z.number().int().positive(),
      })
    )
    .output(
      z.object({
        station_id: z.string(),
        lockerId: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const { MQTTClient } = await import('~/server/mqtt');
      const mqtt = new MQTTClient();
      mqtt.publish('pds_public_broker/load', JSON.stringify({ station_id: input.id, locker_id: input.lockerId }));

      const station = memoryDb.stations?.find(({ stationId }) => stationId === input.id);

      if (station) {
        const locker = station.lockers.find(({ nickname }) => parseInt(nickname) === input.lockerId);
        if (locker) {
          locker.state = LockerStatus.USED;
        }
      }

      return { station_id: input.id, lockerId: input.lockerId };
    }),
});
