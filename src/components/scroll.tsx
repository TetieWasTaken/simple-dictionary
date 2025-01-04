import type { JSX } from "react";
import Image from "next/image";

export default function ScrollToTop(): JSX.Element {
  const smoothlyScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={smoothlyScrollToTop}
      className="fixed bottom-8 left-8 p-2 rounded-lg shadow-lg dark:bg-gray-700 bg-gray-300"
    >
      <Image
        src="/scroll-light.svg"
        alt="Scroll to top"
        width={24}
        height={24}
        className="dark:hidden"
      />
      <Image
        src="/scroll-dark.svg"
        alt="Scroll to top"
        width={24}
        height={24}
        className="hidden dark:block"
      />
    </button>
  );
}
