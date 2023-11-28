import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { UserRole } from '@prisma/client';

export const userRouter = createTRPCRouter({
  getMany: protectedProcedure
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
    .query(async ({ ctx: { db, session } }) => {
      if (session.user.role !== UserRole.ADMIN) throw new Error('Not authorized.');

      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          enabled: true,
        },
      });

      return { users };
    }),

  get: protectedProcedure
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
    .query(async ({ ctx: { db, session } }) => {
      if (session.user.role !== UserRole.ADMIN) throw new Error('Not authorized.');

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
