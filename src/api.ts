"use server";

import { DictionaryError, ErrorType } from "./error";
import type { DictionaryEntry, WikitionaryEntry } from "./types";

const removeHTMLTags = (text: string) => {
  return text.replace(/<[^>]*>/g, "");
};

const parseWiktionaryData = (
  data: Record<string, WikitionaryEntry[]>,
  word: string,
): DictionaryEntry[] => {
  const meanings: DictionaryEntry[] = [];

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const entries = data[key];
      entries.forEach((entry) => {
        const definitions = entry.definitions
          .map((def) => {
            return {
              definition: removeHTMLTags(def.definition),
              example: def.examples?.[0] ? removeHTMLTags(def.examples[0]) : "",
              examples: def.examples ? def.examples.map(removeHTMLTags) : [],
              synonyms: [],
              antonyms: [],
            };
          })
          .filter((def) => def.definition.trim() !== "");

        if (definitions.length > 0) {
          meanings.push({
            word,
            phonetic: "",
            phonetics: [],
            origin: "",
            meanings: [{
              partOfSpeech: entry.partOfSpeech,
              language: entry.language,
              definitions,
            }],
            license: {
              name: "CC-BY-SA 4.0",
              url: "https://en.wiktionary.org/wiki/Wiktionary:CC-BY-SA",
            },
            source: "Wikitionary",
            sourceUrls: [`https://en.wiktionary.org/wiki/${word}`],
            isManualSearch: true,
          });
        }
      });
    }
  }

  return meanings;
};

const fetchFromWikitionary = async (
  word: string,
): Promise<DictionaryEntry[]> => {
  // todo: 200/s rate limit & unique user agent
  const res = await fetch(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${
      encodeURIComponent(
        word,
      )
    }`,
  );

  if (!res.ok) {
    throw new DictionaryError(ErrorType.Failed);
  }

  const data = await res.json();

  if (!data) {
    throw new DictionaryError(ErrorType.Failed);
  }

  return parseWiktionaryData(data, word);
};

export const getData = async (word: string): Promise<DictionaryEntry[]> => {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${
      encodeURIComponent(word)
    }`,
  );

  console.log(res);

  if (!res.ok) {
    if (res.statusText === "Not Found") {
      return fetchFromWikitionary(word);
    } else {
      throw new DictionaryError(ErrorType.Failed);
    }
  }

  return fetchFromWikitionary(word);

  const data = await res.json();
  return data;
};
