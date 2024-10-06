import type { Metadata } from "next";
import { Providers } from "../providers";
import { Toaster } from "../components";
import NextTopLoader from "nextjs-toploader";
import { inter, satoshi } from "@/styles/fonts";
import { cn } from "@turfman/utils";
import "@/styles/global.css";
import "@radix-ui/themes/styles.css";

export const metadata: Metadata = {
  title: "Turfman",
  applicationName: "Turfman",
  description:
    "Automated membership management for the platforms your community already uses.",
  icons: {
    icon: "Turfman-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.PropsWithChildren<any>;
}>): JSX.Element {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(satoshi.variable, inter.variable)}
    >
      <body>
        <NextTopLoader showSpinner={false} color="#10B981" height={3} />
        <Toaster />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
