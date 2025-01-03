import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes"; // not sure how to optimise this
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Header = dynamic(() => import("@/components/header"));
const Loading = dynamic(() => import("@/app/loading"));

export const metadata: Metadata = {
  title: "Simple Dictionary",
  description: "Find definitions easily",
  keywords: ["dictionary", "simple", "easy", "fast"],
  creator: "TetieWasTaken",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Suspense fallback={<Loading />}>
          <ThemeProvider attribute="class">
            <Header />
            {children}
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
