import type { SVGAttributes } from "react";

export default function Dashboard(
  props: SVGAttributes<SVGElement>,
): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 514 458.5"
      fill="currentColor"
      stroke="currentColor"
      {...props}
    >
      <path
        d="M507 185.7L315.7 20.9C283.6-6.7 236.8-7 204.3 20.2L7.2 185.5c-8.5 7.1-9.6 19.7-2.5 28.2 4 4.7 9.6 7.2 15.3 7.2s9.1-1.5 12.8-4.7l25.6-21.4v165.4c.9 54.4 45.4 98.4 100 98.4h197.2c54.6 0 99.1-44 100-98.4V194.3l25.4 21.8c8.4 7.2 21 6.3 28.2-2.1 7.2-8.4 6.3-21-2.1-28.2zM298.7 418.5h-83.5v-65.7c0-23 18.7-41.8 41.8-41.8s41.8 18.7 41.8 41.8v65.7zm116.8-60c0 33.1-26.9 60-60 60h-16.8v-65.7c0-45.1-36.7-81.8-81.8-81.8s-81.8 36.7-81.8 81.8v65.7h-16.8c-33.1 0-60-26.9-60-60V161.2L230 50.9c17.4-14.6 42.4-14.4 59.6.4l126 108.5v198.7z"
        id="Layer_1-2"
      ></path>
    </svg>
  );
}
