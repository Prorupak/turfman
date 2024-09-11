import type { Metadata } from "next";
import { Providers } from "../providers";
import { Toaster } from "../components";
import NextTopLoader from "nextjs-toploader";
import { inter, satoshi } from "@/styles/fonts";
import "@/styles/global.css";
import { cn } from "@turfman/utils";

export const metadata: Metadata = {
  title: "Turfman",
  applicationName: "Turfman",
  description:
    "Automated membership management for the platforms your community already uses.",
  icons: {
    icon: "Turfman-icon.png",
  },
};

// export const viewport: Viewport = {
//   themeColor: [
//     { media: "(prefers-color-scheme: dark)", color: "#27272a" },
//     { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
//   ],
//   colorScheme: "dark light",
// };

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
