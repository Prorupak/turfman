import React, { PropsWithChildren } from "react";
import { Drawer } from "./_components";
import Header from "./_components/Header";

const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="grid h-[100vh] grid-cols-[auto,1fr,auto] grid-rows-[auto,1fr,auto]">
      <div className="col-span-1 row-span-2 bg-slate-600">
        {/* <-- Sidebar Content --> */}
        <Drawer />
      </div>
      <header className="col-span-2 bg-gray-100">
        {/* <-- Header Content --> */}
        <Header />
      </header>

      <main className="col-start-2 col-end-3 bg-white">
        {/* <-- Main Content --> */}
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
