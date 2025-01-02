"use server";

import { DictionaryError, ErrorType } from "./error";
import type { DictionaryEntry, WikitionaryEntry } from "./types";
import { LOG_LEVEL, WIKITIONARY_RATE_LIMIT } from "./constants";
import { log } from "./logger";

const removeHTMLTags = (text: string) => {
  return text.replace(/<[^>]*>/g, "");
};

const parseWiktionaryData = (
  data: Record<string, WikitionaryEntry[]>,
  word: string,
): DictionaryEntry[] => {
  log(
    LOG_LEVEL.DEBUG,
    `Parsing Wiktionary data for ${word}`,
    "parseWiktionaryData()",
  );
  const meanings: DictionaryEntry[] = [];

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
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
              antonyms: [],
              language: entry.language,
              synonyms: [],
              definitions,
            }],
            license: {
              name: "CC-BY-SA 4.0",
              url: "https://en.wiktionary.org/wiki/Wiktionary:CC-BY-SA",
            },
            source: "Wikitionary",
            sourceUrls: [`https://en.wiktionary.org/wiki/${word}`],
            isManualSearch: true,
            key,
          });
        }
      });
    }
  }

  meanings.sort((a, b) => {
    const langA = a.meanings[0].language;
    const langB = b.meanings[0].language;

    if (langA === "English" && langB !== "English") return -1;
    if (langA !== "English" && langB === "English") return 1;

    if (langA === "Scots" && langB !== "Scots") return -1;
    if (langA !== "Scots" && langB === "Scots") return 1;

    return 0;
  });

  return meanings;
};

let requestCount = 0;
let lastReset = Date.now();

const rateLimit = async () => {
  if (requestCount >= WIKITIONARY_RATE_LIMIT) {
    const now = Date.now();
    const timePassed = now - lastReset;

    if (timePassed < 1000) {
      log(
        LOG_LEVEL.WARN,
        `Rate limit reached. Waiting for ${1000 - timePassed}ms`,
        "rateLimit()",
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 - timePassed));
    }

    lastReset = Date.now();
    requestCount = 0;
  }

  requestCount++;
};

const fetchFromWikitionary = async (
  word: string,
): Promise<DictionaryEntry[]> => {
  log(
    LOG_LEVEL.INFO,
    `Fetching data from Wiktionary for ${word}`,
    "fetchFromWikitionary()",
  );
  await rateLimit();

  // todo: test 200/s rate limit, set user agent to repo, redirect parameter
  const res = await fetch(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${
      encodeURIComponent(
        word,
      )
    }`,
    {
      headers: {
        "User-Agent": "https://github.com/TetieWasTaken",
      },
    },
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
  log(
    LOG_LEVEL.INFO,
    `Fetching data from dictionary API for ${word}`,
    "getData()",
  );

  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${
      encodeURIComponent(word)
    }`,
  );

  if (!res.ok) {
    if (res.statusText === "Not Found") {
      log(
        LOG_LEVEL.DEBUG,
        `Word not found in dictionary API for ${word}`,
        "getData()",
      );
      return fetchFromWikitionary(word);
    } else {
      throw new DictionaryError(ErrorType.Failed);
    }
  }

  const data = await res.json();
  return data;
};
