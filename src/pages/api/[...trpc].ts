import type { NextApiRequest, NextApiResponse } from 'next';
import { createOpenApiNextHandler } from 'trpc-openapi';

import { appRouter } from '~/server/api/root';
import { createTRPCHTTPContext } from '~/server/api/trpc';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return await createOpenApiNextHandler({
    router: appRouter,
    createContext: () => createTRPCHTTPContext({ req, res }),
  })(req, res);
};

export default handler;
