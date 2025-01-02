"use client";

export default function Github() {
  return (
    <a
      href="https://github.com/TetieWasTaken/simple-dictionary"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/github-light.svg"
        alt="GitHub"
        className="w-8 h-8 dark:hidden"
      />
      <img
        src="/github-dark.svg"
        alt="GitHub"
        className="w-8 h-8 hidden dark:block"
      />
    </a>
  );
}
