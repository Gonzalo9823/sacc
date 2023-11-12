import { stationRouter } from '~/server/api/routers/station';
import { createTRPCRouter } from '~/server/api/trpc';

export const appRouter = createTRPCRouter({
  station: stationRouter,
});

export type AppRouter = typeof appRouter;
