"use client";
import { toast } from "sonner";
import { ProductSalesData, SalesActivity } from "./_components";
import { Flex } from "antd";

const page = (): JSX.Element => {
  return (
    <Flex vertical gap={4} className="w-max">
      <SalesActivity />
      <ProductSalesData />
    </Flex>
  );
};

export default page;
