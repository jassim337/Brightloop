import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const CUSTOMER_PATHS = ["/my-subscriptions", "/my-invoices", "/payments", "/profile"];
const ADMIN_ONLY_PATHS = ["/users"];

function matches(path: string, list: string[]) {
  return list.some((p) => path === p || path.startsWith(p + "/"));
}

function homeFor(role?: string) {
  return role === "CUSTOMER" ? "/my-subscriptions" : "/dashboard";
}

export default withAuth(
  function proxy(req) {
    const path = req.nextUrl.pathname;
    const token = req.nextauth.token;
    const role = token?.role as string | undefined;

    if (!token) {
      return NextResponse.next();
    }

    if (path === "/" || matches(path, PUBLIC_PATHS)) {
      return NextResponse.redirect(new URL(homeFor(role), req.url));
    }

    if (role === "CUSTOMER" && !matches(path, CUSTOMER_PATHS)) {
      return NextResponse.redirect(new URL("/my-subscriptions", req.url));
    }

    if (role === "STAFF" && matches(path, ADMIN_ONLY_PATHS)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        if (matches(req.nextUrl.pathname, PUBLIC_PATHS)) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};