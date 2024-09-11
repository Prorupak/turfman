import React, { PropsWithChildren } from "react";
import { AppLayout } from "../../../components";

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};

export default AdminLayout;
