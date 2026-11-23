import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect everything except Auth.js routes, the cron job, Next.js assets and public files
  // (any path with a file extension, e.g. /athukorala-logo.png).
  matcher: ["/((?!api/auth|api/cron|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
