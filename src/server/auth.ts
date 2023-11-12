import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession, type DefaultSession, type NextAuthOptions, type Awaitable } from 'next-auth';
import type { UserRole } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';

import { db } from '~/server/db';
import type { AdapterSession, AdapterUser } from 'next-auth/adapters';

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
    jwt: async ({ token, user }) => {
      if (!user) {
        await db.user.findUniqueOrThrow({ where: { id: parseInt(token.sub!), enabled: true } });
      }

      return token;
    },
  },
  adapter: {
    ...PrismaAdapter(db),
    getUser: async (id) => {
      return db.user.findUnique({ where: { id: parseInt(id), enabled: true } }) as unknown as Awaitable<AdapterUser>;
    },
    getUserByEmail: async (email) => {
      return db.user.findUnique({ where: { email, enabled: true } }) as unknown as Awaitable<AdapterUser>;
    },
    async getUserByAccount(provider_providerAccountId) {
      const account = await db.account.findUnique({
        where: { provider_providerAccountId, user: { enabled: true } },
        select: { user: true },
      });
      return (account?.user as unknown as Awaitable<AdapterUser>) ?? null;
    },
    async getSessionAndUser(sessionToken) {
      const userAndSession = await db.session.findUnique({
        where: { sessionToken, user: { enabled: true } },
        include: { user: true },
      });

      if (!userAndSession) return null;

      const { user, ...session } = userAndSession;
      return { user: user as unknown as AdapterUser, session: session as unknown as AdapterSession };
    },
  },
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
