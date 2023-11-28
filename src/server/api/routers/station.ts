import { z } from 'zod';
import { UserRole, LockerStatus, type Prisma } from '@prisma/client';
import { MqttClient } from 'mqtt/*';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { memoryDb } from '~/server/memory-db';

export const stationRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ openapi: { method: 'POST', path: '/stations' } })
    .input(
      z.object({
        location: z.string().trim().min(1),
        allowedForUsers: z.array(z.number().int().positive()).optional(),
        lockers: z.array(
          z.object({
            height: z.number().positive(),
            width: z.number().positive(),
            available: z.boolean(),
          })
        ),
      })
    )
    .output(
      z.object({
        id: z.number(),
        location: z.string(),
        lockers: z.array(
          z.object({
            id: z.number(),
            status: z.nativeEnum(LockerStatus),
            height: z.number(),
            width: z.number(),
            available: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {
      if (session.user.role === UserRole.ADMIN && !input.allowedForUsers) {
        throw new Error(`allowedForUsers must be present for ADMIN users.`);
      }

      const station = await db.station.create({
        include: {
          lockers: {
            select: {
              id: true,
              height: true,
              width: true,
              status: true,
              available: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
        data: {
          location: input.location,
          allowedForUsers: {
            create: session.user.role === UserRole.ADMIN ? input.allowedForUsers!.map((userId) => ({ userId })) : [{ userId: session.user.id }],
          },
          lockers: {
            create: input.lockers.map((locker) => ({
              height: locker.height,
              width: locker.width,
              status: LockerStatus.EMPTY,
              available: locker.available,
            })),
          },
        },
      });

      return station;
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
    .mutation(async ({ ctx: { db, session }, input }) => {
      const { MQTTClient } = await import('~/server/mqtt');
      const mqtt = new MQTTClient();
      mqtt.publish('pds_public_broker/load', JSON.stringify({ station_id: input.id, locker_id: input.lockerId }));
      const station = memoryDb.stations?.find(({ stationId }) => stationId === input.id);
      if (station){
        const locker = station.lockers.find(({ nickname }) => parseInt(nickname) === input.lockerId);
        if (locker){
          locker.state = LockerStatus.USED;
        }
      }
      

      return { station_id: input.id, lockerId: input.lockerId };
    })




  ,
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
    .input(z.object({ id: z.number().int().positive() }))
    .output(
      z.object({
        id: z.number(),
        location: z.string(),
        lockers: z.array(
          z.object({
            id: z.number(),
            status: z.nativeEnum(LockerStatus),
            height: z.number(),
            width: z.number(),
            available: z.boolean(),
          })
        ),
      })
    )
    .query(async ({ ctx: { db, session }, input }) => {
      const station = await db.station.findUniqueOrThrow({
        include: {
          lockers: {
            select: {
              id: true,
              height: true,
              width: true,
              status: true,
              available: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
        where: {
          id: input.id,
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

      return station;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: 'PATCH', path: '/stations/{id}' } })
    .input(
      z.object({
        id: z.number().int().positive(),
        station: z.object({
          location: z.string().trim().min(1).optional(),
          allowedForUsers: z.array(z.number().int().positive()).optional(),
          lockers: z.array(
            z.object({
              id: z.number().int().positive().optional(),
              height: z.number().positive(),
              width: z.number().positive(),
              available: z.boolean(),
            })
          ),
        }),
      })
    )
    .output(
      z.object({
        id: z.number(),
        location: z.string(),
        lockers: z.array(
          z.object({
            id: z.number(),
            status: z.nativeEnum(LockerStatus),
            height: z.number(),
            width: z.number(),
            available: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx: { db, session }, input }) => {
      if (session.user.role === UserRole.ADMIN && !input.station.allowedForUsers) {
        throw new Error(`allowedForUsers must be present for ADMIN users.`);
      }

      const station = await db.station.findUniqueOrThrow({
        include: {
          lockers: true,
        },
        where: {
          id: input.id,
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

      if (input.station.location && station.lockers.some(({ status }) => status !== LockerStatus.EMPTY)) {
        throw new Error(`Can't update the location of a Station with active reservations.`);
      }

      const { creates, updates } = input.station.lockers.reduce<{
        updates: Prisma.LockerUpdateManyWithWhereWithoutStationInput[];
        creates: (Prisma.Without<Prisma.LockerCreateInput, Prisma.LockerUncheckedCreateInput> & Prisma.LockerUncheckedCreateInput)[];
      }>(
        (data, locker) => {
          const alreadyAddedLocker = station.lockers.find(({ id }) => id === locker.id);

          if (alreadyAddedLocker) {
            if (alreadyAddedLocker.status !== LockerStatus.EMPTY) {
              throw new Error(`Can't update locker in use.`);
            }

            data.updates.push({
              where: { id: locker.id },
              data: {
                width: locker.width,
                height: locker.height,
                available: locker.available,
              },
            });

            return data;
          }

          data.creates.push({
            status: LockerStatus.EMPTY,
            width: locker.width,
            height: locker.height,
            available: locker.available,
            stationId: station.id,
          });

          return data;
        },
        { updates: [], creates: [] }
      );

      const updatedStation = await db.station.update({
        include: {
          lockers: {
            select: {
              id: true,
              height: true,
              width: true,
              status: true,
              available: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
        data: {
          location: input.station.location ?? station.location,
          lockers: {
            updateMany: updates,
            createMany: {
              data: creates,
            },
          },
          ...(session.user.role === UserRole.ADMIN ? { allowedForUsers: { set: [] } } : {}),
        },
        where: {
          id: input.id,
        },
      });

      if (session.user.role !== UserRole.ADMIN) return updatedStation;

      return await db.station.update({
        include: {
          lockers: {
            select: {
              id: true,
              height: true,
              width: true,
              status: true,
              available: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
        where: {
          id: station.id,
        },
        data: {
          allowedForUsers: {
            createMany: {
              data: input.station.allowedForUsers!.map((userId) => ({ userId })),
            },
          },
        },
      });
    }),
});
