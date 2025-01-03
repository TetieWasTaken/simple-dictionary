"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

// todo: placeholder until mounted
export default function Theme() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <div>
      <button
        onClick={() => {
          toggleTheme();
        }}
      >
        {theme === "dark"
          ? (
            <Image
              src="/moon.svg"
              alt="Toggle Dark Mode"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          )
          : (
            <Image
              src="/sun.svg"
              alt="Toggle Light Mode"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          )}
      </button>
    </div>
  );
}
