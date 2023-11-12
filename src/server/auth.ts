import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, type DefaultSession, type NextAuthOptions, type Awaitable } from 'next-auth';
import type { UserRole } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';

import { db } from '~/server/db';
import type { AdapterUser } from 'next-auth/adapters';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: number;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: parseInt(token.sub!) as unknown as string,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = await db.user.findUnique({ where: { email: credentials!.email, password: credentials!.password, enabled: true } });
        return user as Awaitable<AdapterUser> | null;
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
export const getHTTPServerAuthSession = (req: NextApiRequest, res: NextApiResponse) => getServerSession(req, res, authOptions);
