import { User } from "@turfman/types";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export const getUserViaToken = async (req: NextRequest) => {
  const session = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as {
    email?: string;
    user?: User;
  };

  return session?.user;
};
