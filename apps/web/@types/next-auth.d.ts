import "next-auth";
import "next-auth/jwt";
import { UserProps } from "./user";

declare module "next-auth/jwt" {
  export interface JWT {
    accessToken: string;
    refreshToken: string;
    id: string;
    email: string;
    displayName: string;
    emailConfirmed: boolean;
    postcode: string;
    roles: string[];
    id: string;
    exp: number;
  }
}

declare module "next-auth" {
  export interface Session extends UserProps {
    exp: number;
    error: string;
    iat: number;
  }
}
