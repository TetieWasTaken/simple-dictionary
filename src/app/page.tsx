"use client";

// react imports
import { useState } from "react";

// types
import { DictionaryEntry } from "@/types";

export default function Home() {
  const [word, setWord] = useState("");
  const [data, setData] = useState<DictionaryEntry>();

  const fetchData = async (word: string) => {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${
        encodeURIComponent(word)
      }`,
    );
    const json = await res.json();
    return json;
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      try {
        const data = await fetchData(word);
        setData(data[0]);
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
        <input
          type="text"
          placeholder="Enter a word..."
          className="block w-4/5 p-4 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {data && (
        <div className="mt-8 w-full max-w-3xl p-8 rounded-lg shadow-lg bg-gray-700">
          <h2 className="text-3xl font-bold mb-2 text-white">{data.word}</h2>
          {data.phonetic && (
            <p className="text-lg italic text-gray-400 mb-4">
              [{data.phonetic}]
            </p>
          )}

          {data.meanings.map((meaning, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold text-blue-400">
                {meaning.partOfSpeech}
              </h3>
              {meaning.definitions.length > 2
                ? (
                  <details className="mb-4">
                    <summary className="text-lg text-white cursor-pointer">
                      Multiple definitions available
                    </summary>
                    {meaning.definitions.map((definition, defIndex) => (
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
        </div>
      )}
    </div>
  );
}
