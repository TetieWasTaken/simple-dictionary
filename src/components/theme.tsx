"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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
          ? <img src="/moon.svg" alt="Toggle Dark Mode" className="w-8 h-8" />
          : <img src="/sun.svg" alt="Toggle Light Mode" className="w-8 h-8" />}
      </button>
    </div>
  );
}
