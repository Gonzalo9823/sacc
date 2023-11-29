import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '~/server/api/trpc';

export const userRouter = createTRPCRouter({
  getMany: adminProcedure
    .meta({ openapi: { method: 'GET', path: '/users' } })
    .input(z.void())
    .output(
      z.object({
        users: z
          .object({
            id: z.number(),
            email: z.string(),
            enabled: z.boolean(),
          })
          .array(),
      })
    )
    .query(async ({ ctx: { db } }) => {
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          enabled: true,
        },
      });

      return { users };
    }),

  get: adminProcedure
    .meta({ openapi: { method: 'GET', path: '/users/{id}' } })
    .input(z.object({ id: z.number() }))
    .output(
      z.object({
        users: z
          .object({
            id: z.number(),
            email: z.string(),
            enabled: z.boolean(),
          })
          .array(),
      })
    )
    .query(async ({ ctx: { db } }) => {
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          enabled: true,
        },
      });

      return { users };
    }),
});
