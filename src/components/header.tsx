import Theme from "./theme";
import Github from "./github";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gray-300 dark:bg-gray-700 shadow-lg transition-all duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold dark:text-white text-gray-900 transition-all duration-300 ease-in-out">
          Simple Dictionary
        </h2>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-4">
        <a
          href="/"
          className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg shadow-md hover:bg-blue-400 dark:hover:bg-blue-600 transition-all duration-300 ease-in-out"
        >
          Home
        </a>
        <a
          href="/info"
          className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg shadow-md hover:bg-blue-400 dark:hover:bg-blue-600 transition-all duration-300 ease-in-out"
        >
          About & Legal
        </a>
      </div>
      <div className="flex space-x-4">
        <Theme />
        <Github />
      </div>
    </div>
  );
}
