import type { JSX } from "react";
import type { Meaning } from "@/types";
import { RiArrowDropDownLine } from "react-icons/ri";

interface PartOfSpeechProps {
  meaning: Meaning;
  index: number;
  defIndex: number;
  toggleOpen: (key: string) => void;
  isOpen: (key: string) => boolean;
  decodeHTML: (input: string) => string;
}

export default function PartOfSpeech({
  meaning,
  index,
  defIndex,
  toggleOpen,
  isOpen,
  decodeHTML,
}: PartOfSpeechProps): JSX.Element {
  return (
    <div key={index} className="mb-6">
      <h3 className="text-xl font-semibold dark:text-blue-400 text-blue-600">
        {meaning.partOfSpeech}
      </h3>
      {meaning.language && (
        <p className="text-sm dark:text-gray-400 text-gray-600">
          {meaning.language}
        </p>
      )}
      {meaning.definitions.length > 1
        ? (
          <>
            <p className="text-lg dark:text-white text-gray-900">
              {decodeHTML(meaning.definitions[0].definition)}
            </p>
            {meaning.definitions[0].example && (
              <p className="dark:text-gray-400 text-gray-600 mt-1">
                Example:{" "}
                <span className="italic">
                  {decodeHTML(meaning.definitions[0].example)}
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
            <div className="mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen(`${index}-${defIndex}`);
                }}
                className="text-lg dark:text-blue-300 text-blue-600 cursor-pointer mt-2 focus:outline-none hover:border-b-2 hover:border-blue-400"
              >
                <span className="inline-flex items-center">
                  {meaning.definitions.length - 1} More
                  {meaning.definitions.length > 2
                    ? " definitions "
                    : " definition "}
                  available
                  <RiArrowDropDownLine />
                </span>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen(`${index}-${defIndex}`)
                    ? "max-h-max opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {meaning.definitions.slice(1).map((
                  definition,
                  defIndex,
                ) => (
                  <div key={defIndex} className="mt-2">
                    <hr className="my-2 dark:border-gray-600 border-gray-400" />
                    <p className="text-lg dark:text-white text-gray-900">
                      {decodeHTML(definition.definition)}
                    </p>
                    {definition.example && (
                      <p className="dark:text-gray-400 text-gray-600 mt-1">
                        Example:{" "}
                        <span className="italic">
                          {decodeHTML(definition.example)}
                        </span>
                      </p>
                    )}
                    {definition.synonyms.length > 0 && (
                      <p className="text-base dark:text-blue-400 text-blue-600">
                        {definition.synonyms.length > 1
                          ? "Synonyms"
                          : "Synonym"}
                        :{" "}
                        <span className="dark:text-gray-400 text-gray-600 italic">
                          {definition.synonyms.join(", ")}
                        </span>
                      </p>
                    )}
                    {definition.antonyms.length > 0 && (
                      <p className="text-base dark:text-blue-400 text-blue-600">
                        {definition.antonyms.length > 1
                          ? "Antonyms"
                          : "Antonym"}
                        :{" "}
                        <span className="dark:text-gray-400 text-gray-600 italic">
                          {definition.antonyms.join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )
        : (
          meaning.definitions.map((definition, defIndex) => (
            <div key={defIndex} className="mb-4">
              <p className="text-lg dark:text-white text-gray-900">
                {decodeHTML(definition.definition)}
              </p>
              {definition.example && (
                <p className="dark:text-gray-400 text-gray-600 mt-1">
                  Example:{" "}
                  <span className="italic">
                    {decodeHTML(definition.example)}
                  </span>
                </p>
              )}
              {definition.synonyms.length > 0 && (
                <p className="text-base dark:text-blue-400 text-blue-600">
                  {definition.synonyms.length > 1 ? "Synonyms" : "Synonym"}
                  :{" "}
                  <span className="dark:text-gray-400 text-gray-600 italic">
                    {definition.synonyms.join(", ")}
                  </span>
                </p>
              )}
              {definition.antonyms.length > 0 && (
                <p className="text-base dark:text-blue-400 text-blue-600">
                  {definition.antonyms.length > 1 ? "Antonyms" : "Antonym"}
                  :{" "}
                  <span className="dark:text-gray-400 text-gray-600 italic">
                    {definition.antonyms.join(", ")}
                  </span>
                </p>
              )}
            </div>
          ))
        )}
    </div>
  );
}
