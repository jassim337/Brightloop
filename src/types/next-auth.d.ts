import type { Role } from "@/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    organizationId: string;
    customerId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string;
      customerId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: Role;
    organizationId: string;
    customerId: string | null;
  }
}