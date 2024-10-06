import { Flex, Typography } from "antd";
import React from "react";

type DashboardCardProps = React.FC<React.PropsWithChildren<{ title: string }>>;

const DashboardCard: DashboardCardProps = ({ children, title }) => {
  return (
    <Flex
      vertical
      // gap="middle"
      className="rounded-md border border-gray-200 shadow-sm"
    >
      <Flex className="border border-gray-200 bg-gray-100 p-2">
        <Typography.Title level={5} className="font-medium">
          {title}
        </Typography.Title>
      </Flex>

      <div className="w-full p-4">{children}</div>
    </Flex>
  );
};

export default DashboardCard;
