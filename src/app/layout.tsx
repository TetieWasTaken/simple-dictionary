import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes"; // not sure how to optimise this
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/header"));

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
        <ThemeProvider attribute="class">
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
