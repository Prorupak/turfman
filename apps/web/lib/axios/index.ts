import Axios from "axios";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { authOptions } from "../auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default Axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosAuth = async (isClient: boolean = true) => {
  const session = isClient
    ? await getSession()
    : await getServerSession(authOptions);

  console.log("axios-client", { session });
  return Axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: false,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
      "Access-Control-Allow-Origin": "*",
    },
  });
};
