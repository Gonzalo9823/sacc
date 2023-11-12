import { stringify } from 'qs';
import { z } from 'zod';
import { env } from '~/env.mjs';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const authRouter = createTRPCRouter({
  logIn: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/auth' } })
    .input(z.object({ email: z.string().email(), password: z.string().trim().min(1) }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const csrfApiResponse = await fetch(`${env.NEXTAUTH_URL}/api/auth/csrf`);
      const csrfSetCookiesWithOptions = csrfApiResponse.headers.getSetCookie();
      const setCookiesArray = [...csrfSetCookiesWithOptions];
      const setCookiesKeyValue = setCookiesArray.map((cookie) => cookie.split(';')[0]).join('; ');
      const csrfAuthTokenResponse = (await csrfApiResponse.json()) as { csrfToken: string };
      const csrfAuthToken = csrfAuthTokenResponse.csrfToken;

      const credentialsResponse = await fetch(`${env.NEXTAUTH_URL}/api/auth/callback/credentials?`, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          cookie: setCookiesKeyValue,
        },
        body: stringify({
          email: input.email,
          password: input.password,
          callbackUrl: '/',
          redirect: 'false',
          csrfToken: csrfAuthToken,
          json: true,
        }),
        method: 'POST',
      });

      return {
        token: credentialsResponse.headers.getSetCookie()[1]!.split('=')[1]!.split(';')[0]!,
      };
    }),
});
