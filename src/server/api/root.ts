import { stationRouter } from '~/server/api/routers/station';
import { authRouter } from '~/server/api/routers/auth';

import { createTRPCRouter } from '~/server/api/trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  station: stationRouter,
});

export type AppRouter = typeof appRouter;
