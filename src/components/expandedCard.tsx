import type { DictionaryEntry } from "@/types";
import type { JSX } from "react";

interface ExpandedCardProps {
  expandedCard: number;
  setExpandedCardAction: (expandedCard: number | null) => void;
  rawData: DictionaryEntry[];
  decodeHTMLAction: (input: string) => string;
}

export default function expandedCardComponent({
  expandedCard,
  setExpandedCardAction,
  rawData,
  decodeHTMLAction,
}: ExpandedCardProps): JSX.Element {
  return (
    <>
      <style jsx global>
        {`
          body { overflow: hidden; }
        `}
      </style>
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
        onClick={() => setExpandedCardAction(null)}
      >
        <div
          className={`w-full max-w-5xl p-8 rounded-lg shadow-lg dark:bg-gray-700 bg-gray-300 ${
            rawData[expandedCard].inaccurate
              ? "border-2 dark:border-yellow-500 border-amber-600"
              : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-2 left-2 dark:text-white text-gray-900 cursor-pointer focus:outline-none hover:underline dark:hover:text-blue-400 text-blue-600 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg"
            onClick={() => setExpandedCardAction(null)}
          >
            Close
          </button>
          {rawData[expandedCard].inaccurate && (
            <p className="text-sm dark:text-yellow-500 text-amber-600">
              WARNING! This definition may be inaccurate due to it possibly
              being sourced from multiple (unrelated) sources.
            </p>
          )}
          <h2 className="text-3xl font-bold mb-2 dark:text-white text-gray-900">
            {rawData[expandedCard].word}
          </h2>
          {rawData[expandedCard].phonetic || rawData[expandedCard].phonetics
            ? (
              <p className="text-lg italic dark:text-gray-400 text-gray-600 mb-4">
                {rawData[expandedCard].phonetic && (
                  <span className="mr-2">
                    {rawData[expandedCard].phonetic}
                  </span>
                )}
                {rawData[expandedCard].phonetics &&
                  rawData[expandedCard].phonetics[0] &&
                  rawData[expandedCard].phonetics[0].audio &&
                  (
                    <button
                      onClick={() => {
                        const audio = new Audio(
                          rawData[expandedCard].phonetics[0].audio,
                        );
                        audio.play();
                      }}
                    >
                      🔊
                    </button>
                  )}
              </p>
            )
            : null}

          {rawData[expandedCard].origin && (
            <p className="text-lg dark:text-gray-400 text-gray-600 mb-4">
              Origin: {rawData[expandedCard].origin}
            </p>
          )}

          {rawData[expandedCard].meanings.map((meaning, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold dark:text-blue-400 text-blue-600">
                {meaning.partOfSpeech}
              </h3>
              {meaning.language && (
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  {meaning.language}
                </p>
              )}
              <p className="text-lg dark:text-white text-gray-900">
                {decodeHTMLAction(meaning.definitions[0].definition)}
              </p>
              {meaning.definitions[0].example && (
                <p className="dark:text-gray-400 text-gray-600 mt-1">
                  Example:{" "}
                  <span className="italic">
                    {decodeHTMLAction(meaning.definitions[0].example)}
                  </span>
                </p>
              )}
              {meaning.definitions[0].synonyms.length > 0 && (
                <p className="text-base dark:text-blue-400 text-blue-600">
                  {meaning.definitions[0].synonyms.length > 1
                    ? "Synonyms"
                    : "Synonym"}
                  :{" "}
                  <span className="dark:text-gray-400 text-gray-600 italic">
                    {meaning.definitions[0].synonyms.join(", ")}
                  </span>
                </p>
              )}
              {meaning.definitions[0].antonyms.length > 0 && (
                <p className="text-base dark:text-blue-400 text-blue-600">
                  {meaning.definitions[0].antonyms.length > 1
                    ? "Antonyms"
                    : "Antonym"}
                  :{" "}
                  <span className="dark:text-gray-400 text-gray-600 italic">
                    {meaning.definitions[0].antonyms.join(", ")}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
