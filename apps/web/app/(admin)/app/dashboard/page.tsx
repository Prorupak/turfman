"use client";
import { toast } from "sonner";

const page = (): JSX.Element => {
  const notify = () => {
    toast.success("Hello world");
  };
  return (
    <form className="flex flex-col gap-4" action={notify}>
      <button className="text-red-500">Hello world</button>
    </form>
  );
};

export default page;
