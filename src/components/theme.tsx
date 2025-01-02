"use client";

import { useEffect, useState } from "react";

// todo: fix flicker on page load
export default function Theme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
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
