"use client";

// react imports
import { useEffect, useState } from "react";

// types
import { DictionaryEntry, License } from "@/types";

// constants
import { LOOKUP_SYNONYMS } from "@/constants";

export default function Home() {
  const [word, setWord] = useState("");
  const [data, setData] = useState<DictionaryEntry>();
  const [lookupWord, setLookupWord] = useState("");
  const [source, setSource] = useState("");
  const [license, setLicense] = useState<License>();

  useEffect(() => {
    const randomSynonym =
      LOOKUP_SYNONYMS[Math.floor(Math.random() * LOOKUP_SYNONYMS.length)];
    setLookupWord(randomSynonym);
  }, []);

  const fetchData = async (word: string) => {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${
        encodeURIComponent(word)
      }`,
    );
    const json = await res.json();
    console.log(json);
    setData(json[0]);
    setSource(json[0].sourceUrls[0]);
    setLicense(json[0].license);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      try {
        await fetchData(word);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center p-8 rounded-lg shadow-lg bg-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Simple Dictionary
        </h2>

        <form>
          <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
            <input
              type="search"
              id="search"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search"
              required
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="text-white absolute end-2.5 bottom-2.5 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await fetchData(word);
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              {lookupWord}
            </button>
          </div>
        </form>
      </div>

      {data && (
        <div className="mt-8 w-full max-w-3xl p-8 rounded-lg shadow-lg bg-gray-700">
          <h2 className="text-3xl font-bold mb-2 text-white">{data.word}</h2>
          {data.phonetic || data.phonetics
            ? (
              <p className="text-lg italic text-gray-400 mb-4">
                {data.phonetic && <span className="mr-2">{data.phonetic}</span>}
                {data.phonetics && data.phonetics[0] &&
                  data.phonetics[0].audio &&
                  (
                    <button
                      onClick={() => {
                        const audio = new Audio(data.phonetics[0].audio);
                        audio.play();
                      }}
                    >
                      🔊
                    </button>
                  )}
              </p>
            )
            : null}

          {data.origin && (
            <p className="text-lg text-gray-400 mb-4">
              Origin: {data.origin}
            </p>
          )}

          {data.meanings.map((meaning, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold text-blue-400">
                {meaning.partOfSpeech}
              </h3>
              {meaning.definitions.length > 2
                ? (
                  <>
                    <p className="text-lg text-white">
                      {meaning.definitions[0].definition}
                    </p>
                    {meaning.definitions[0].example && (
                      <p className="text-gray-400 mt-1">
                        Example: {meaning.definitions[0].example}
                      </p>
                    )}
                    <details className="mb-4">
                      <summary className="text-lg text-white cursor-pointer mt-2">
                        More definitions available
                      </summary>
                      {meaning.definitions.slice(1).map((
                        definition,
                        defIndex,
                      ) => (
                        <div key={defIndex} className="mt-2">
                          <p className="text-lg text-white">
                            {definition.definition}
                          </p>
                          {definition.example && (
                            <p className="text-gray-400 mt-1">
                              Example: {definition.example}
                            </p>
                          )}
                        </div>
                      ))}
                    </details>
                  </>
                )
                : (
                  meaning.definitions.map((definition, defIndex) => (
                    <div key={defIndex} className="mb-4">
                      <p className="text-lg text-white">
                        {definition.definition}
                      </p>
                      {definition.example && (
                        <p className="text-gray-400 mt-1">
                          Example: {definition.example}
                        </p>
                      )}
                    </div>
                  ))
                )}
            </div>
          ))}

          <hr className="my-4 border-gray-600" />

          {source && (
            <p className="text-sm text-gray-400">
              Definition source:{" "}
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {source}
              </a>{" "}
              <span className="text-gray-400">|</span>{" "}
              <a
                href="https://dictionaryapi.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                dictionaryapi.dev
              </a>
            </p>
          )}

          {license && (
            <p className="text-sm text-gray-400">
              Definition license:{" "}
              <a
                href={license.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {license.name}
              </a>
            </p>
          )}

          <hr className="my-4 border-gray-600" />

          {data.phonetics && (
            <div>
              {data.phonetics[0].sourceUrl && (
                <p className="text-sm text-gray-400">
                  Phonetics Source:{" "}
                  <a
                    href={data.phonetics[0].sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {data.phonetics[0].sourceUrl}
                  </a>{" "}
                  <span className="text-gray-400">|</span>{" "}
                  <a
                    href="https://dictionaryapi.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    dictionaryapi.dev
                  </a>
                </p>
              )}

              {data.phonetics[0].license && (
                <p className="text-sm text-gray-400">
                  Phonetics License:{" "}
                  <a
                    href={data.phonetics[0].license.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {data.phonetics[0].license.name}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
