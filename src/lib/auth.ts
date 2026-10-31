import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";

export type AppSession = {
  userId: string;
  role: Role;
  organizationId: string;
  customerId: string | null;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { customer: { select: { id: true } } },
        });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          customerId: user.customer?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.customerId = user.customerId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.organizationId = token.organizationId;
      session.user.customerId = token.customerId;
      return session;
    },
  },
};

export async function getSession(): Promise<AppSession | null> {
  const s = await getServerSession(authOptions);
  if (!s?.user) return null;
  return {
    userId: s.user.id,
    role: s.user.role,
    organizationId: s.user.organizationId,
    customerId: s.user.customerId,
  };
}

export async function requireRole(roles: Role[]): Promise<AppSession> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Not logged in");
  if (!roles.includes(session.role)) throw new ApiError(403, "Not allowed");
  return session;
}