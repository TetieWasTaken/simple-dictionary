"use client";

import Image from "next/image";
import Link from "next/link";

export default function Github() {
  return (
    <Link
      href="https://github.com/TetieWasTaken/simple-dictionary"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src="/github-light.svg"
        alt="GitHub"
        width={32}
        height={32}
        className="w-8 h-8 dark:hidden"
      />
      <Image
        src="/github-dark.svg"
        alt="GitHub"
        width={32}
        height={32}
        className="w-8 h-8 hidden dark:block"
      />
    </Link>
  );
}
