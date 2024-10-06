import { useSalesActivity } from "@/hooks/api";
import { Typography } from "antd";
import DashboardCard from "./DashboardCard";

const { Title, Text } = Typography;

const SalesActivity = () => {
  const { data } = useSalesActivity();

  // Assuming the API response has one entry for the sales activity data
  const salesData = data ? data[0] : { totalSales: 0, totalOrders: 0 };

  const activityData = [
    {
      count: salesData?.totalOrders,
      label: "TOTAL ORDERS",
      unit: "Qty",
      color: "blue",
    },
    // { count: 0, label: "TO BE SHIPPED", unit: "Pkgs", color: "red" },
    // { count: 0, label: "TO BE DELIVERED", unit: "Pkgs", color: "green" },
    {
      count: salesData?.totalSales,
      label: "TOTAL SALES",
      unit: "Qty",
      color: "gold",
    },
  ];

  return (
    <DashboardCard title="Sales Activity">
      <div className="sales-activity-flex-container">
        {activityData.map((item, index) => (
          <div className="activity-item-wrapper" key={index}>
            <div
              // className="activity-item"
              className={
                // wee need border right for all items except the last one use tailwindcss
                index === activityData.length - 1
                  ? "activity-item"
                  : "activity-item border-r border-gray-200 pr-6"
              }
            >
              <Title level={2} style={{ color: item.color }}>
                {item.count}
              </Title>
              <Text>{item.unit}</Text>
              <br />
              <Text>{item.label}</Text>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default SalesActivity;
