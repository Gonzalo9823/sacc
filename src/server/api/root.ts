import { authRouter } from '~/server/api/routers/auth';
import { stationRouter } from '~/server/api/routers/station';
import { reservationRouter } from '~/server/api/routers/reservation';
import { signInRouter } from '~/server/api/routers/signIn'; // Import the signInRouter module


import { createTRPCRouter } from '~/server/api/trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  station: stationRouter,
  reservation: reservationRouter,
  signIn: signInRouter, // Add signInRouter to the appRouter object
});

export type AppRouter = typeof appRouter;
