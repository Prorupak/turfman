import { User, type NextAuthOptions } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserProps } from "../../@types/user";

export const authOptions: NextAuthOptions = {
  providers: [
    // Sign in with email and password
    CredentialsProvider({
      id: "credentials",
      type: "credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials, req) {
        console.log("called", credentials);
        if (!credentials) {
          throw new Error("no-credentials");
        }

        const { email, password } = credentials;

        if (!email || !password) {
          throw new Error("no-credentials");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: email,
              password,
            }),
          },
        );

        console.log({ response });

        if (!response.ok) {
          throw new Error("invalid-credentials");
        }

        const user = await response.json();

        if (!user) {
          throw new Error("invalid-credentials");
        }

        return user;
      },
    }),
  ],
  // @ts-ignore
  session: { strategy: "jwt" },
  pages: {
    error: "/login",
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({
      token,
      user,
    }: {
      token: JWT;
      user: User | AdapterUser | UserProps;
      trigger?: "signIn" | "update" | "signUp";
    }) => {
      if (user) {
        token.accessToken = (user as UserProps).accessToken;
        token.refreshToken = (user as UserProps).refreshToken;
        token.user = user;
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = token.user as UserProps["user"];
      return Promise.resolve(session);
    },
  },
};
