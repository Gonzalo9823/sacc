import { authRouter } from '~/server/api/routers/auth';
import { stationRouter } from '~/server/api/routers/station';
import { reservationRouter } from '~/server/api/routers/reservation';
import { userRouter } from '~/server/api/routers/user';
import { lockerRouter } from '~/server/api/routers/locker';

import { createTRPCRouter } from '~/server/api/trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  station: stationRouter,
  reservation: reservationRouter,
  locker: lockerRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
