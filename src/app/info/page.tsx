import dynamic from "next/dynamic";
import { Suspense } from "react";

const About = dynamic(() => import("@/contents/markdown/about.mdx"));
const Legal = dynamic(() => import("@/contents/markdown/legal.mdx"));

export default async function Info() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 dark:bg-gray-800 bg-gray-200 min-h-screen p-4 pt-20 overflow-auto">
      <h1 className="text-4xl font-semibold dark:text-white text-gray-900 transition-all duration-300 ease-in-out mt-4">
        Simple Dictionary
      </h1>
      <div className="flex flex-row space-x-4 w-full justify-center mt-4">
        <div className="flex flex-col items-center space-y-2 w-1/2 border-r border-gray-400">
          <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
            About
          </h2>
          <div className="text-md">
            <Suspense fallback={<p>Loading...</p>}>
              <About />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2 w-1/2 border-gray-400">
          <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
            Legal Statement
          </h2>
          <div className="text-md">
            <Suspense fallback={<p>Loading...</p>}>
              <Legal />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
