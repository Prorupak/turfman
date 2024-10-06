import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  let path = req.nextUrl.pathname;

  const session = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as any;
  console.log({ session });
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
