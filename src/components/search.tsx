import { log } from "@/logger";
import { LOG_LEVEL } from "@/constants";
import { type JSX, Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { getRandomWord } from "@/getData";

interface SearchFormProps {
  word: string;
  setWord: (word: string) => void;
  autoComplete: (word: string) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  fetchData: (word: string) => Promise<void>;
  lookupWord: string;
}

export default function SearchForm({
  word,
  setWord,
  autoComplete,
  handleKeyDown,
  fetchData,
  lookupWord,
}: SearchFormProps): JSX.Element {
  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async (
    e,
  ) => {
    e.preventDefault();
    try {
      await fetchData(word);
    } catch (error) {
      if (error instanceof Error) {
        log(
          LOG_LEVEL.ERROR,
          `Failed to fetch data for word: ${word}: ${error.message}`,
          "handleSubmit()",
        );
      } else {
        log(
          LOG_LEVEL.ERROR,
          `Failed to fetch data for word: ${word}: Unknown error`,
          "handleSubmit()",
        );
      }
    }
  };

  const [randomWord, setRandomWord] = useState<string>("");
  const [loadingRandomWord, setLoadingRandomWord] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    const fetchRandomWord = async () => {
      setLoadingRandomWord(true);
      setRandomWord(await getRandomWord(window.location.origin));
      setLoadingRandomWord(false);
      setReload(false);
    };

    fetchRandomWord();
  }, [reload]);

  const smoothlyScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <form className="w-full">
        <label
          htmlFor="search"
          className="mb-2 text-sm font-medium sr-only dark:text-white text-gray-900"
        >
          Search
        </label>
        <div className="relative">
          <Suspense fallback={<p>Loading...</p>}>
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
          </Suspense>
          <Suspense fallback={<p>Loading...</p>}>
            <input
              type="search"
              id="search"
              className="block w-full p-6 ps-12 text-lg border rounded-lg dark:bg-gray-700 bg-gray-300 dark:border-gray-600 border-gray-400 dark:placeholder-gray-400 placeholder-gray-600 dark:text-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-transform duration-300"
              placeholder="Search"
              required
              value={word}
              onChange={async (e) => {
                setWord(e.target.value);
                await autoComplete(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              style={{ minWidth: "200px" }}
              autoComplete="off"
            />
          </Suspense>
          <Suspense fallback={<p>Loading...</p>}>
            <button
              type="submit"
              className="absolute end-2.5 bottom-2.5 dark:text-white text-gray-900 font-medium rounded-lg text-lg px-6 py-3 dark:bg-blue-600 bg-blue-400 dark:hover:bg-blue-700 hover:bg-blue-500 focus:ring-4 dark:focus:ring-blue-800 focus:ring-blue-600"
              onClick={(e) => {
                handleSubmit(e);
              }}
            >
              {lookupWord === "" ? "search" : lookupWord}
            </button>
          </Suspense>
        </div>
      </form>
      <Suspense fallback={<p>Loading...</p>}>
        <button
          type="button"
          className="fixed bottom-8 right-8 dark:text-white text-gray-900 font-medium rounded-lg text-lg px-6 py-3 dark:bg-blue-600 bg-blue-400 dark:hover:bg-blue-700 hover:bg-blue-500 focus:ring-4 dark:focus:ring-blue-800 focus:ring-blue-600"
          onClick={() => {
            setWord(randomWord);
            setReload(true);
            smoothlyScrollToTop();
          }}
        >
          {loadingRandomWord
            ? (
              "Loading..."
            )
            : (
              <Image
                src="/die.svg"
                alt="Random word"
                width={24}
                height={24}
              />
            )}
        </button>
      </Suspense>
    </>
  );
}
