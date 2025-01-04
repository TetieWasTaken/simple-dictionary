"use client";

// react & next
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// types
import type { AutocompleteResult, DictionaryEntry, License } from "@/types";

// constants
import { LOG_LEVEL, LOOKUP_SYNONYMS } from "@/constants";
import { DictionaryError, ErrorType } from "@/error";

// server side
import { log } from "@/logger";

// components
const DictionaryEntryComponent = dynamic(
  () => import("@/components/dictionaryEntry"),
  { ssr: false },
);
const ExpandedCardComponent = dynamic(
  () => import("@/components/expandedCard"),
  { ssr: false },
);
const ScrollToTop = dynamic(() => import("@/components/scroll"), {
  ssr: false,
});
const SearchForm = dynamic(() => import("@/components/search"));

function HomeContent() {
  const searchParams = useSearchParams();
  const [word, setWord] = useState(
    decodeURIComponent(searchParams.get("w") || ""),
  );

  const [lookupWord, setLookupWord] = useState("");
  useEffect(() => {
    const randomSynonym =
      LOOKUP_SYNONYMS[Math.floor(Math.random() * LOOKUP_SYNONYMS.length)];
    log(
      LOG_LEVEL.DEBUG,
      `Setting lookup word to ${randomSynonym}`,
      "useEffect()",
    );
    setLookupWord(randomSynonym);
  }, []);

  useEffect(() => {
    const loadTrie = async () => {
      const buildTrie = (await import("@/trie")).buildTrie;
      buildTrie();
    };
    loadTrie();
  }, []);

  const router = useRouter();

  const sanitiseInput = useCallback(
    (input: string) =>
      input.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim(),
    [],
  );

  const [isFetching, setIsFetching] = useState(false);
  const [dataPerf, setDataPerf] = useState<number | null>(null);
  const [autoCompleteWords, setAutoCompleteWords] = useState<
    AutocompleteResult | null
  >(null);
  const autoComplete = useCallback(async (word: string) => {
    if (isFetching) return;

    word = sanitiseInput(word);

    if (word.length < 2) {
      setAutoCompleteWords(null);
      return;
    }

    const start = performance.now();
    const getAutoComplete = (await import("@/trie")).getAutoComplete;
    const autoCompleteWordResult = await getAutoComplete(word);
    const end = performance.now();

    log(
      LOG_LEVEL.DEBUG,
      `Auto complete took ${end - start}ms`,
      "autoComplete()",
    );

    if (!autoCompleteWordResult) {
      setAutoCompleteWords(null);
      return;
    }

    log(
      LOG_LEVEL.DEBUG,
      `Auto complete words: ${autoCompleteWordResult.words}`,
      "autoComplete()",
    );

    setDataPerf(null);

    setAutoCompleteWords(autoCompleteWordResult);
  }, [isFetching, sanitiseInput]);

  const [openedIndex, setOpenedIndex] = useState<string[]>([]);
  const [openedLanguages, setOpenedLanguages] = useState<string[]>(["en"]);

  const [rawData, setRawData] = useState<DictionaryEntry[]>([]);
  const [source, setSource] = useState("");
  const [license, setLicense] = useState<License>();
  const [error, setError] = useState<DictionaryError>();
  const fetchData = useCallback(async (word: string) => {
    setIsFetching(true);
    setError(undefined);
    setAutoCompleteWords(null);

    word = sanitiseInput(word);

    if (!rawData.some((entry) => entry.word === word)) {
      setRawData([]);
    } else {
      log(
        LOG_LEVEL.DEBUG,
        `Data for ${word} already exists, not fetching`,
        "fetchData()",
      );
      setIsFetching(false);
      return;
    }
    setOpenedIndex([]);
    setOpenedLanguages(["en"]);

    log(LOG_LEVEL.INFO, `Fetching data for ${word}`, "fetchData()");

    const startPerf = performance.now();

    try {
      const getData = (await import("@/getData")).getData;
      const res = await getData(word);

      if ("error" in res) {
        if (res.type !== ErrorType.NotFound) {
          log(
            LOG_LEVEL.ERROR,
            `Failed to fetch data for ${word}: ${res.type}`,
            "fetchData()",
          );
        }

        setRawData([]);
        setError(new DictionaryError(res.type as ErrorType));
        setIsFetching(false);
        return;
      }

      setRawData(res);
      setSource(res[0].sourceUrls[0]);
      setLicense(res[0].license);

      const endPerf = performance.now();
      setDataPerf(endPerf - startPerf);
      log(
        LOG_LEVEL.DEBUG,
        `Fetching data for ${word} took ${endPerf - startPerf}ms`,
        "fetchData()",
      );
      router.push(`/?w=${encodeURIComponent(word)}`);
    } catch (error) {
      log(
        LOG_LEVEL.ERROR,
        `Failed to fetch data for ${word}`,
        "fetchData()",
      );

      if (error instanceof Error) {
        log(LOG_LEVEL.ERROR, error.message, "fetchData()");
      } else {
        log(LOG_LEVEL.ERROR, "Unknown error", "fetchData()");
      }

      setError(new DictionaryError(ErrorType.Failed));
    }

    setIsFetching(false);
  }, [rawData, router, sanitiseInput]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        try {
          await fetchData(word);
        } catch (error) {
          log(
            LOG_LEVEL.ERROR,
            `Failed to fetch data for ${word}`,
            "handleKeyDown()",
          );
          if (error instanceof Error) {
            log(LOG_LEVEL.ERROR, error.message, "handleKeyDown()");
          } else {
            log(LOG_LEVEL.ERROR, "Unknown error", "handleKeyDown()");
          }
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (!autoCompleteWords) return;

        log(LOG_LEVEL.DEBUG, "Tab pressed", "handleKeyDown()");

        setWord(autoCompleteWords.words[0]);
        setAutoCompleteWords(null);
      }
    },
    [autoCompleteWords, fetchData, word],
  );

  const toggleOpen = useCallback((id: string) => {
    log(LOG_LEVEL.DEBUG, `Toggling open for ${id}`, "toggleOpen()");

    setOpenedIndex((prevOpenedIndex) =>
      prevOpenedIndex.includes(id)
        ? prevOpenedIndex.filter((index) => index !== id)
        : [...prevOpenedIndex, id]
    );
  }, []);

  const isOpen = useCallback((id: string) => openedIndex.includes(id), [
    openedIndex,
  ]);

  const toggleLanguage = useCallback((language: string | undefined) => {
    if (!language) return;

    log(
      LOG_LEVEL.DEBUG,
      `Toggling language open for ${language}`,
      "toggleLanguage()",
    );

    setOpenedLanguages((prevOpenedLanguages) =>
      prevOpenedLanguages.includes(language)
        ? prevOpenedLanguages.filter((lang) => lang !== language)
        : [...prevOpenedLanguages, language]
    );
  }, []);

  const isLanguageOpen = useCallback(
    (language: string) => openedLanguages.includes(language),
    [openedLanguages],
  );

  const decodeHTML = useCallback((input: string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    const text = doc.documentElement.textContent;
    if (!text) return input;
    return text.replace(/:$/, "");
  }, []);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="dark:bg-gray-800 bg-gray-200 min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ease-in-out">
      <div
        className={`flex flex-col items-center p-10 rounded-lg shadow-lg dark:bg-gray-700 bg-gray-300 w-full max-w-3xl mt-20 transition-all duration-300 ease-in-out ${
          expandedCard !== null ? "blur-sm" : ""
        }`}
      >
        {showScrollToTop && (
          <Suspense fallback={<div>Loading...</div>}>
            <ScrollToTop />
          </Suspense>
        )}

        <h2 className="text-3xl font-semibold mb-6 dark:text-white text-gray-900">
          Simple Dictionary
        </h2>

        <Suspense fallback={<div>Loading...</div>}>
          <SearchForm
            word={word}
            setWord={setWord}
            autoComplete={autoComplete}
            handleKeyDown={handleKeyDown}
            fetchData={fetchData}
            lookupWord={lookupWord}
          />
        </Suspense>

        {autoCompleteWords && autoCompleteWords.words.length > 0 && (
          <div className="mt-2 text-sm dark:text-gray-400 text-gray-600">
            Did you mean: {autoCompleteWords.words.map((word, index) => (
              <span
                key={index}
                className="cursor-pointer dark:text-blue-400 text-blue-600 hover:underline"
                onClick={() => {
                  setWord(word);
                  setAutoCompleteWords(null);
                }}
              >
                {word}
                {index < autoCompleteWords.words.length - 1 && ", "}
              </span>
            ))} ({autoCompleteWords.performance.toFixed(3)}ms)
          </div>
        )}

        {dataPerf && (
          <div className="mt-2 text-sm dark:text-gray-400 text-gray-600">
            Data fetched in
            <span className="font-semibold dark:text-gray-400 text-gray-600">
              {" "}
              {dataPerf.toFixed(0)}ms
            </span>
          </div>
        )}

        <div className="mt-4 text-xs dark:text-gray-400 text-gray-600">
          By using this service, you agree to the terms and policies outlined in
          our{" "}
          <Link
            href="/info"
            className="underline dark:text-blue-400 text-blue-600 hover:text-blue-800"
          >
            Legal Statement
          </Link>.
        </div>

        {error && (
          <>
            <div className="mt-8 w-full max-w-3xl p-8 rounded-lg shadow-lg dark:bg-red-700 bg-red-500">
              <h2 className="text-3xl font-bold mb-2 dark:text-white text-gray-900">
                {error.type}
              </h2>
              <p className="text-lg dark:text-white text-gray-900">
                {error.message}
              </p>
            </div>
            <p>
              Try searching this on google instead:{" "}
              <a
                href={`https://www.google.com/search?q=${
                  encodeURIComponent(word + " definition")
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline dark:text-blue-200 text-blue-600 hover:text-blue-800"
              >
                {word}
              </a>
            </p>
          </>
        )}
      </div>

      {isFetching && (
        <div className="mt-8 dark:text-white text-gray-900 text-lg">
          Fetching data...
        </div>
      )}

      {expandedCard !== null && (
        <ExpandedCardComponent
          expandedCard={expandedCard}
          rawData={rawData}
          setExpandedCardAction={setExpandedCard}
          decodeHTMLAction={decodeHTML}
        />
      )}

      {rawData.length > 0 && (
        <>
          <div
            className={`w-full max-w-3xl transition-all duration-300 ease-in-out overflow-hidden ${
              rawData.length > 0 ? "max-h-max opacity-100" : "max-h-0 opacity-0"
            } ${expandedCard !== null ? "blur-sm overflow-hidden" : ""}`}
            key={word}
          >
            {rawData.map((data, defIndex) => (
              <Suspense key={defIndex} fallback={<div>Loading...</div>}>
                <DictionaryEntryComponent
                  key={defIndex}
                  data={data}
                  defIndex={defIndex}
                  toggleOpen={toggleOpen}
                  isOpen={isOpen}
                  toggleLanguage={toggleLanguage}
                  isLanguageOpen={isLanguageOpen}
                  source={source}
                  setExpandedCard={setExpandedCard}
                  rawData={rawData}
                  decodeHTML={decodeHTML}
                  license={license}
                />
              </Suspense>
            ))}
          </div>
          <p className="mt-4 text-sm dark:text-gray-400 text-gray-600">
            Not what you were looking for?{" "}
            <Link
              href={`https://www.google.com/search?q=${
                encodeURIComponent(
                  word + " definition",
                )
              }`}
              className="underline dark:text-blue-400 text-blue-600 hover:text-blue-800"
            >
              Try searching on Google
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
