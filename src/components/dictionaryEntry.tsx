import type { JSX } from "react";
import type { DictionaryEntry, License } from "@/types";
import Link from "next/link";
import dynamic from "next/dynamic";

const PartOfSpeech = dynamic(() => import("./partOfSpeech"));
const RiArrowDropDownLine = dynamic(() =>
  import("react-icons/ri").then((mod) => mod.RiArrowDropDownLine)
);

interface DictionaryEntryProps {
  data: DictionaryEntry;
  defIndex: number;
  toggleLanguage: (key: string | undefined) => void;
  isLanguageOpen: (key: string) => boolean;
  setExpandedCard: (expandedCard: number | null) => void;
  rawData: DictionaryEntry[];
  toggleOpen: (key: string) => void;
  isOpen: (key: string) => boolean;
  decodeHTML: (input: string) => string;
  source: string | undefined;
  license: License | undefined;
}

export default function DictionaryEntryComponent({
  data,
  defIndex,
  toggleLanguage,
  isLanguageOpen,
  setExpandedCard,
  rawData,
  toggleOpen,
  isOpen,
  decodeHTML,
  source,
  license,
}: DictionaryEntryProps): JSX.Element {
  return (
    <div
      key={defIndex}
      className="w-full max-w-3xl"
    >
      {rawData[defIndex - 1] &&
        rawData[defIndex - 1].key !== data.key && (
        <>
          <hr className="my-8 border-gray-600" />
          <button
            onClick={() => toggleLanguage(data.key)}
            className="text-lg dark:text-white text-gray-900 cursor-pointer mt-2 focus:outline-none max-w-3xl p-2 rounded-lg shadow-lg dark:bg-gray-700 bg-gray-300"
          >
            <span className="inline-flex items-center">
              <RiArrowDropDownLine />
              {isLanguageOpen(data.key || "en") ? "Hide" : "Show"}{" "}
              {data.meanings[0].language || "English"} definitions
            </span>
          </button>
        </>
      )}

      <div
        className={`w-full max-w-3xl rounded-lg shadow-lg dark:bg-gray-700 bg-gray-300 transition-all duration-300 ease-in-out overflow-hidden ${
          isLanguageOpen(data.key || "en")
            ? "max-h-max opacity-100 p-8 mt-8"
            : "max-h-0 opacity-0 p-0 mt-0"
        }`}
        onClick={() => setExpandedCard(defIndex)}
      >
        <h2 className="text-3xl font-bold mb-2 dark:text-white text-gray-900">
          {data.word}
        </h2>
        {data.phonetic || data.phonetics
          ? (
            <p className="text-lg italic dark:text-gray-400 text-gray-600 mb-4">
              {data.phonetic && <span className="mr-2">{data.phonetic}</span>}
              {data.phonetics && data.phonetics[0] &&
                data.phonetics[0].audio &&
                (
                  <button
                    onClick={() => {
                      const audio = new Audio(
                        data.phonetics[0].audio,
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

        {data.meanings.map((meaning, index) => (
          <PartOfSpeech
            key={index}
            meaning={meaning}
            index={index}
            defIndex={defIndex}
            toggleOpen={toggleOpen}
            isOpen={isOpen}
            decodeHTML={decodeHTML}
          />
        ))}

        <hr className="my-4 dark:border-gray-600 border-gray-400" />

        {source && (
          <p className="text-sm dark:text-gray-400 text-gray-600">
            Definition source:{" "}
            <Link
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              onClick={(e) => e.stopPropagation()}
            >
              {source}
            </Link>
            {!data.isManualSearch && (
              <>
                {" "}
                <span className="dark:text-gray-400 text-gray-600">
                  |
                </span>{" "}
                <Link
                  href="https://dictionaryapi.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  dictionaryapi.dev
                </Link>
              </>
            )}
          </p>
        )}

        {license && (
          <p className="text-sm dark:text-gray-400 text-gray-600">
            Definition license:{" "}
            <Link
              href={license.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              onClick={(e) => e.stopPropagation()}
            >
              {license.name}
            </Link>
          </p>
        )}

        <hr className="my-4 dark:border-gray-600 border-gray-400" />

        {data.phonetics && data.phonetics[0] && (
          <div>
            {data.phonetics[0].sourceUrl && (
              <p className="text-sm dark:text-gray-400 text-gray-600">
                Phonetics Source:{" "}
                <Link
                  href={data.phonetics[0].sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {data.phonetics[0].sourceUrl}
                </Link>{" "}
                <span className="dark:text-gray-400 text-gray-600">
                  |
                </span>{" "}
                <Link
                  href="https://dictionaryapi.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  dictionaryapi.dev
                </Link>
              </p>
            )}

            {data.phonetics[0].license && (
              <p className="text-sm dark:text-gray-400 text-gray-600">
                Phonetics License:{" "}
                <Link
                  href={data.phonetics[0].license.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {data.phonetics[0].license.name}
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
