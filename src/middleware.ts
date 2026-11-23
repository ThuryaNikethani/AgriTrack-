import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect everything except Auth.js routes, the cron job, static files and images.
  matcher: ["/((?!api/auth|api/cron|_next/static|_next/image|favicon.ico).*)"],
};
