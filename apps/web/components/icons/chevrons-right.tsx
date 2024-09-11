import { SVGAttributes } from "react";

export default function ChevronsRight(
  props: SVGAttributes<SVGElement>,
): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 17l5-5-5-5M13 17l5-5-5-5" />
    </svg>
  );
}
