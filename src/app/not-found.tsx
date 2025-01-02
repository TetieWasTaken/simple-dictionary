import Link from "next/link";

export default async function NotFound() {
  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <Link href="/">
          Return to Home
        </Link>
      </button>
    </div>
  );
}
