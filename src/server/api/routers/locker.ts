import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { memoryDb } from '~/server/memory-db';
import { LockerStatus } from '~/interfaces/Locker';
import { TRPCError } from '@trpc/server';
import { Mailer } from '~/server/mailer';
import { MQTTClient } from '~/server/mqtt';

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
          nickname: z.number(),
          loaded: z.boolean(),
          confirmedOperator: z.boolean(),
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
          stationName: true,
          lockerId: true,
          loaded: true,
          confirmed_operator: true,
        },
        where:
          input.type === 'client'
            ? {
                clientPassword: input.password,
                expired: false,
                confirmed_client: true,
                confirmed_operator: true,
                loaded: true,
                completed: false,
              }
            : {
                operatorPassword: input.password,
                expired: false,
                confirmed_client: true,
                loaded: false,
                completed: false,
              },
      });

      const station = memoryDb.stations?.find(({ stationName }) => stationName === reservation.stationName);
      const locker = station?.lockers.find(({ nickname }) => nickname === reservation.lockerId);

      if (!locker) throw new TRPCError({ code: 'NOT_FOUND' });

      console.log({ locker: { ...locker, loaded: reservation.loaded, confirmedOperator: reservation.confirmed_operator } });

      return { locker: { ...locker, loaded: reservation.loaded, confirmedOperator: reservation.confirmed_operator } };
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
          nickname: z.number(),
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
          clientEmail: true,
          clientPassword: true,
          stationName: true,
          lockerId: true,
        },
        where:
          input.type === 'client'
            ? {
                clientPassword: input.password,
                expired: false,
                confirmed_client: true,
                confirmed_operator: true,
                loaded: true,
                completed: false,
              }
            : {
                operatorPassword: input.password,
                expired: false,
                confirmed_client: true,
                confirmed_operator: true,
                loaded: false,
                completed: false,
              },
      });

      const station = memoryDb.stations?.find(({ stationName }) => stationName === reservation.stationName);
      const locker = station?.lockers.find(({ nickname }) => nickname === reservation.lockerId);

      if (!locker) throw new TRPCError({ code: 'NOT_FOUND' });

      await new MQTTClient().publishAsync(
        input.type === 'operator' ? 'load' : 'unload',
        JSON.stringify({ station_name: station?.stationName, nickname: locker.nickname })
      );

      await db.reservation.update({
        data: {
          ...(input.type === 'operator' ? { loaded: true, loadedAt: new Date() } : { completed: true, completedAt: new Date() }),
        },
        where: {
          id: reservation.id,
        },
      });

      if (input.type === 'operator') {
        await new Mailer()
          .sendEmail({
            to: reservation.clientEmail,
            subject: '¡Reserva Confirmada (Cliente)!',
            text: `Se confirmo la reserva en la estación ${reservation.stationName}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.`,
            html: `<p>Se confirmo la reserva en la estación ${reservation.stationName}, locker ${reservation.lockerId} con contraseña ${reservation.clientPassword}.</p>`,
          })
          .catch((err) => console.log(err));
      }

      return { locker };
    }),
});
