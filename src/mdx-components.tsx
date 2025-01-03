import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-semibold dark:text-white text-gray-900 transition-all duration-300 ease-in-out mt-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
        {children}
      </h2>
    ),
    p: ({ children }) => (
      <p className="text-sm font-normal mb-4 dark:text-white text-gray-900">
        {children}
      </p>
    ),
    a: ({ children, href }) => (
      <Link
        href={href}
        className="text-blue-200 dark:text-blue-300 hover:underline inline-flex items-center"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
        {href?.startsWith("http") && (
          <>
            <Image
              src="/external-light.svg"
              alt="External Link"
              width={16}
              height={16}
              className="w-4 h-4 ml-1 dark:hidden"
            />
            <Image
              src="/external-dark.svg"
              alt="External Link"
              width={16}
              height={16}
              className="w-4 h-4 ml-1 hidden dark:block"
            />
          </>
        )}
      </Link>
    ),
    ul: ({ children }) => (
      <ul className="ml-4 text-sm dark:text-white text-gray-900 font-normal">
        {children}
      </ul>
    ),
    li: ({ children }) => <li className="mb-2">{children}</li>,
    ...components,
  };
}
