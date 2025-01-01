"use client";

// react imports
import { useEffect, useState } from "react";

// types
import type { AutocompleteResult, DictionaryEntry, License } from "@/types";

// constants
import { LOOKUP_SYNONYMS } from "@/constants";
import { DictionaryError } from "@/error";

// server side
import { getData } from "@/api";
import { buildTrie, getAutoComplete } from "@/trie";

export default function Home() {
  const [word, setWord] = useState("");
  const [data, setData] = useState<DictionaryEntry[]>();
  const [lookupWord, setLookupWord] = useState("");
  const [source, setSource] = useState("");
  const [license, setLicense] = useState<License>();
  const [error, setError] = useState<DictionaryError>();
  const [autoCompleteWords, setAutoCompleteWords] = useState<
    AutocompleteResult | null
  >(null);

  useEffect(() => {
    const randomSynonym =
      LOOKUP_SYNONYMS[Math.floor(Math.random() * LOOKUP_SYNONYMS.length)];
    setLookupWord(randomSynonym);
  }, []);

  const fetchData = async (word: string) => {
    setError(undefined);

    // todo: if word is already in data, don't fetch again

    try {
      const res = await getData(word);

      console.log(res);

      setData(res);
      setSource(res[0].sourceUrls[0]);
      setLicense(res[0].license);
    } catch (error) {
      if (error instanceof DictionaryError) {
        console.log("error instance of DictionaryError");

        setData(undefined);
        setSource("");
        setLicense(undefined);
        setError(error);
        return;
      }

      console.log("error not instance of DictionaryError");
      console.log(typeof error);
      console.log(error.constructor.name);
      console.log(error);

      console.error(error);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      try {
        await fetchData(word);
      } catch (error) {
        console.error(error);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!autoCompleteWords) return;

      setWord(autoCompleteWords.words[0]);
      setAutoCompleteWords(null);
    }
  };

  useEffect(() => {
    buildTrie();
  }, []);

  const autoComplete = async (word: string) => {
    if (word.length < 2) {
      setAutoCompleteWords(null);
      return;
    }

    const start = performance.now();
    const autoCompleteWordResult = await getAutoComplete(word);
    const end = performance.now();
    console.log("Time taken to get auto complete", end - start);

    console.log("Auto complete word", autoCompleteWordResult);

    if (!autoCompleteWordResult) {
      setAutoCompleteWords(null);
      return;
    }

    setAutoCompleteWords(autoCompleteWordResult);
  };

  const decodeHTML = (input: string) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    const text = doc.documentElement.textContent;
    if (!text) return input;
    return text.replace(/:$/, "");
  };

  // todo: animations, effects, loading states, optimisations
  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center p-10 rounded-lg shadow-lg bg-gray-700 w-full max-w-3xl">
        <h2 className="text-3xl font-semibold mb-6 text-white">
          Simple Dictionary
        </h2>

        <form className="w-full">
          <label className="mb-2 text-sm font-medium sr-only text-white">
            Search
          </label>
          <div className="relative">
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
            <input
              type="search"
              id="search"
              className="block w-full p-6 ps-12 text-lg border rounded-lg bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 transition-transform duration-300"
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
            <button
              type="submit"
              className="absolute end-2.5 bottom-2.5 text-white font-medium rounded-lg text-lg px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-800"
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

        {autoCompleteWords && autoCompleteWords.words.length > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            Did you mean: {autoCompleteWords.words.map((word, index) => (
              <span
                key={index}
                className="cursor-pointer text-blue-400 hover:underline"
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

        {error && (
          <div className="mt-8 w-full max-w-3xl p-8 rounded-lg shadow-lg bg-red-700">
            <h2 className="text-3xl font-bold mb-2 text-white">{error.type}</h2>
            <p className="text-lg text-white">{error.message}</p>
          </div>
        )}
      </div>

      {data && (
        <>
          {data.map((data, index) => (
            <div
              className="mt-8 w-full max-w-3xl p-8 rounded-lg shadow-lg bg-gray-700"
              key={index}
            >
              <h2 className="text-3xl font-bold mb-2 text-white">
                {data.word}
              </h2>
              {data.phonetic || data.phonetics
                ? (
                  <p className="text-lg italic text-gray-400 mb-4">
                    {data.phonetic && (
                      <span className="mr-2">{data.phonetic}</span>
                    )}
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
                  {meaning.language && (
                    <p className="text-sm text-gray-400">
                      {meaning.language}
                    </p>
                  )}
                  {meaning.definitions.length > 1
                    ? (
                      <>
                        <p className="text-lg text-white">
                          {decodeHTML(meaning.definitions[0].definition)}
                        </p>
                        {meaning.definitions[0].example && (
                          <p className="text-gray-400 mt-1">
                            Example:{" "}
                            {decodeHTML(meaning.definitions[0].example)}
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
                              <hr className="my-2 border-gray-600" />
                              <p className="text-lg text-white">
                                {decodeHTML(definition.definition)}
                              </p>
                              {definition.example && (
                                <p className="text-gray-400 mt-1">
                                  Example: {decodeHTML(definition.example)}
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
                            {decodeHTML(definition.definition)}
                          </p>
                          {definition.example && (
                            <p className="text-gray-400 mt-1">
                              Example: {decodeHTML(definition.example)}
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
                  </a>
                  {!data.isManualSearch && (
                    <>
                      {" "}
                      <span className="text-gray-400">|</span>{" "}
                      <a
                        href="https://dictionaryapi.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        dictionaryapi.dev
                      </a>
                    </>
                  )}
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

              {data.phonetics[0] && (
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
          ))}
        </>
      )}
    </div>
  );
}
