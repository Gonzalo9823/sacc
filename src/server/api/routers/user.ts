import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '~/server/api/trpc';

export const userRouter = createTRPCRouter({
  create: adminProcedure
    .meta({ openapi: { method: 'POST', path: '/users' } })
    .input(
      z.object({
        name: z.string().trim().min(1),
        email: z.string().email(),
        password: z.string().min(1),
        role: z.nativeEnum(UserRole),
        enabled: z.boolean(),
      })
    )
    .output(
      z.object({
        name: z.string().trim().min(1),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      await db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
          enabled: input.enabled,
        },
      });

      return {
        name: input.name,
        email: input.email,
      };
    }),

  getMany: adminProcedure
    .meta({ openapi: { method: 'GET', path: '/users' } })
    .input(z.void())
    .output(
      z.object({
        users: z
          .object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
            enabled: z.boolean(),
            role: z.nativeEnum(UserRole),
          })
          .array(),
      })
    )
    .query(async ({ ctx: { db } }) => {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          enabled: true,
          role: true,
        },
      });

      return { users };
    }),

  get: adminProcedure
    .meta({ openapi: { method: 'GET', path: '/users/{id}' } })
    .input(z.object({ id: z.coerce.number() }))
    .output(
      z.object({
        user: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
          enabled: z.boolean(),
          role: z.nativeEnum(UserRole),
          reservations: z.array(
            z.object({
              id: z.number(),
              stationName: z.string(),
              lockerId: z.number(),
              expired: z.boolean(),
              completed: z.boolean(),
              createdAt: z.date(),
            })
          ),
        }),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      const { Reservation, ...user } = await db.user.findFirstOrThrow({
        select: {
          id: true,
          name: true,
          email: true,
          enabled: true,
          role: true,
          Reservation: {
            select: {
              id: true,
              stationName: true,
              lockerId: true,
              expired: true,
              completed: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        where: {
          id: input.id,
        },
      });

      return {
        user: {
          ...user,
          reservations: Reservation,
        },
      };
    }),

  toggleEnabled: adminProcedure
    .meta({ openapi: { method: 'POST', path: '/users/{id}/toggle-enabled' } })
    .input(z.object({ id: z.coerce.number() }))
    .output(z.void())
    .mutation(async ({ ctx: { db }, input }) => {
      const user = await db.user.findFirstOrThrow({
        select: {
          id: true,
          email: true,
          enabled: true,
        },
        where: {
          id: input.id,
        },
      });

      await db.user.update({
        data: {
          enabled: !user.enabled,
        },
        where: {
          id: user.id,
        },
      });
    }),
});
