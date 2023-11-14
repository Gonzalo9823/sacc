import { authRouter } from '~/server/api/routers/auth';
import { stationRouter } from '~/server/api/routers/station';
import { reservationRouter } from '~/server/api/routers/reservation';

import { createTRPCRouter } from '~/server/api/trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  station: stationRouter,
  reservation: reservationRouter,
});

export type AppRouter = typeof appRouter;
