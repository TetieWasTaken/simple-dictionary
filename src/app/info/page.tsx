export default async function Info() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 dark:bg-gray-800 bg-gray-200 min-h-screen p-4">
      <h1 className="text-4xl font-semibold dark:text-white text-gray-900 transition-all duration-300 ease-in-out mt-4">
        Simple Dictionary
      </h1>
      <div className="flex flex-row space-x-4 w-full justify-center mt-4">
        <div className="flex flex-col items-center space-y-2 w-1/3 border-r border-gray-400">
          <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
            About
          </h2>
          <p className="text-md dark:text-white text-gray-900">
            Information about the dictionary
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 w-1/3 border-r border-gray-400">
          <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
            Legal
          </h2>
          <p className="text-md dark:text-white text-gray-900">
            Legal information
          </p>
        </div>
        <div className="flex flex-col items-center space-y-2 w-1/3">
          <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
            Credits/Sources
          </h2>
          <p className="text-md dark:text-white text-gray-900">
            Sources and credits
          </p>
        </div>
      </div>
    </div>
  );
}
