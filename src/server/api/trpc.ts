import type { NextApiRequest, NextApiResponse } from 'next';
import { initTRPC, TRPCError } from '@trpc/server';
import type { OpenApiMeta } from 'trpc-openapi';
import type { NextRequest } from 'next/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { getHTTPServerAuthSession, getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const session = await getServerAuthSession();

  return {
    session,
    req: opts.req.headers,
    db,
  };
};

export const createTRPCHTTPContext = async (opts: { req: NextApiRequest; res: NextApiResponse }) => {
  const session = await getHTTPServerAuthSession(opts.req, opts.res);

  return {
    session,
    req: opts.req.headers as unknown as NextRequest['headers'],
    db,
  };
};

const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
