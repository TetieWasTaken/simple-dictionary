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
    <div className="bg-gray-800 min-h-screen flex justify-center items-center">
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
        <div className="mt-8 p-8 rounded-lg shadow-lg bg-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            {data.word}
          </h2>
          <p className="text-lg text-gray-300">{data.phonetic}</p>
          <ul className="list-disc list-inside text-gray-300 mt-4">
            {data.meanings.map((meaning, index) => (
              <li key={index} className="mb-4">
                <h3 className="text-xl font-semibold text-white">
                  {meaning.partOfSpeech}
                </h3>
                <ul className="list-disc list-inside text-gray-300 mt-2">
                  {meaning.definitions.map((definition, index) => (
                    <li key={index} className="mb-2">
                      <p className="text-lg text-white">
                        {definition.definition}
                      </p>
                      <p className="text-gray-400">{definition.example}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
