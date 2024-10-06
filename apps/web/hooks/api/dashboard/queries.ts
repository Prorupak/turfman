import { axiosAuth } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import httpRequest from "../../../utils/fetcher";
import { SalesActivity, TopSellingItems } from "./types";

export const useSalesActivity = () => {
  return useQuery({
    queryKey: ["sales-activity"],
    retry: 1,
    queryFn: async () => {
      const path = "dashboard/sales-statistics";

      return httpRequest({
        url: path,
        method: "GET",
      })<SalesActivity[]>(await axiosAuth());
    },
  });
};

export const useSalesData = (query?: any) => {
  return useQuery({
    queryKey: ["sales-data"],
    retry: 1,
    queryFn: async () => {
      const path = "/dashboard/product-sales-data";

      return httpRequest({
        url: path,
        method: "GET",
        params: query,
      })<TopSellingItems>(await axiosAuth());
    },
  });
};
