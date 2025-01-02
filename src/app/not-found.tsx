import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 dark:bg-gray-800 bg-white">
      <h1 className="text-4xl font-bold dark:text-white text-black">
        404 - Page Not Found
      </h1>
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <Link href="/">
          Return to Home
        </Link>
      </button>
    </div>
  );
}
