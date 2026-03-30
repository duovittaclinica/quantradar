import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '../database/client';

declare module 'next-auth' {
  interface Session {
    user: { id: string; email: string; name?: string|null; image?: string|null; role: string; plan: string; planExpiresAt?: string|null; profile: string; };
  }
  interface User { id: string; role: string; plan: string; planExpiresAt?: Date|null; profile: string; }
}
declare module 'next-auth/jwt' {
  interface JWT { id: string; role: string; plan: string; planExpiresAt?: string|null; profile: string; }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/auth/login', newUser: '/auth/register', error: '/auth/error' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Senha', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email }, include: { plan: true } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role, plan: user.plan.name, planExpiresAt: user.planExpiresAt, profile: user.profile };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) { token.id=user.id; token.role=user.role; token.plan=user.plan; token.planExpiresAt=user.planExpiresAt?.toISOString()??null; token.profile=user.profile; }
      if (trigger==='update'&&session?.plan) token.plan=session.plan;
      return token;
    },
    async session({ session, token }) {
      session.user.id=token.id as string; session.user.role=token.role as string;
      session.user.plan=token.plan as string; session.user.planExpiresAt=token.planExpiresAt as string|null;
      session.user.profile=token.profile as string;
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider==='google') {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!existing) {
          const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
          if (freePlan) await prisma.user.create({ data: { email: user.email!, name: user.name, image: user.image, planId: freePlan.id, role: 'USER', profile: 'MODERADO' } });
        }
      }
      return true;
    },
  },
};
