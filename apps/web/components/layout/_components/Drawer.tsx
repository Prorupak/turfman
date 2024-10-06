"use client";

import ChevronsRight from "@/components/icons/chevrons-right";
import { cn } from "@turfman/utils";
import Link from "next/link";
import { useState } from "react";
import { SIDEBAR_DATA } from "../../../constants";

const Sidebar = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    // <nav className="border-r-1 relative h-full max-w-[12.5rem] border-gray-100 text-gray-50 sm:hidden lg:block">
    <nav
      className={cn(
        "border-r-1 relative h-full max-w-[12.5rem] border-gray-100 text-gray-50",
        isOpen && "w-64",
      )}
    >
      <p className="border-b border-gray-100 py-2 text-center text-lg font-medium">
        {/* The Turfman */}
        {isOpen ? "The Turfman" : "TT"}
      </p>
      <section className="mt-4 flex flex-col gap-2 p-2">
        {SIDEBAR_DATA.map((item, index) => (
          <SidebarItem key={index} item={item} isOpen={isOpen} />
        ))}
      </section>
      <button
        className="absolute bottom-0 flex w-full items-center justify-center bg-slate-500 p-2 hover:bg-slate-600"
        onClick={toggleSidebar}
      >
        <ChevronsRight
          // className="h-5 w-5 text-white"
          className={cn("h-5 w-5 text-white", isOpen && "rotate-180 transform")}
        />
      </button>
    </nav>
  );
};

// Sidebar Item Component
const SidebarItem = ({ item, isOpen }: { item: any; isOpen: boolean }) => {
  return (
    <Link href={item.path}>
      <div className="flex cursor-pointer items-start justify-between rounded-xl p-2 pl-3 hover:bg-slate-500">
        <div className="flex items-center gap-2 text-start">
          {item.icon && <item.icon className={cn("h-5 w-5 text-white")} />}
          {isOpen && <p>{item.title}</p>}
        </div>
      </div>
    </Link>
  );
};

export default Sidebar;
