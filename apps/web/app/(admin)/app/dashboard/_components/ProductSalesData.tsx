import { useSalesData } from "@/hooks/api";
import DashboardCard from "./DashboardCard";

const ProductSalesData = () => {
  const { data, isLoading, isError, error } = useSalesData();
  return (
    <DashboardCard title="Top Selling Items">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Failed to load data, {JSON.stringify(error)}</p>}
      {data && (
        <div>
          {data.data.map((item, index) => (
            <div key={index}>
              <p>{item.product.name}</p>
              <p>{item.totalRevenue}</p>
              <p>{item.totalUnitsSold}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default ProductSalesData;
