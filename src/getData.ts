"use server";

import { DictionaryError, ErrorType, serialiseError } from "./error";
import type {
  DictionaryEntry,
  DictionaryErrorJSON,
  WiktionaryEntry,
} from "./types";
import { LOG_LEVEL, WIKTIONARY_RATE_LIMIT } from "./constants";
import { log } from "./logger";

const removeHTMLTags = (text: string) => text.replace(/<[^>]*>/g, "");

const parseWiktionaryData = (
  data: Record<string, WiktionaryEntry[]>,
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
          .map((def) => ({
            definition: removeHTMLTags(def.definition),
            example: def.examples?.[0] ? removeHTMLTags(def.examples[0]) : "",
            examples: def.examples ? def.examples.map(removeHTMLTags) : [],
            synonyms: [],
            antonyms: [],
          }))
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
            source: "Wiktionary",
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
  if (requestCount >= WIKTIONARY_RATE_LIMIT) {
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

const fetchFromWiktionary = async (
  word: string,
): Promise<DictionaryEntry[]> => {
  log(
    LOG_LEVEL.INFO,
    `Fetching data from Wiktionary for ${word}`,
    "fetchFromWiktionary()",
  );
  await rateLimit();

  const res = await fetch(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${
      encodeURIComponent(word)
    }`,
    {
      headers: {
        "User-Agent": "https://github.com/TetieWasTaken",
      },
    },
  );

  if (!res.ok) {
    if (res.status === 404) {
      log(
        LOG_LEVEL.DEBUG,
        `Word not found in Wiktionary for ${word}`,
        "fetchFromWiktionary()",
      );
      throw new DictionaryError(ErrorType.NotFound);
    } else {
      log(
        LOG_LEVEL.WARN,
        `Status ${res.status} for Wiktionary request for ${word}`,
        "fetchFromWiktionary()",
      );
      throw new DictionaryError(ErrorType.Failed);
    }
  }

  const data = await res.json();

  if (!data) {
    log(
      LOG_LEVEL.WARN,
      `No data found in Wiktionary for ${word}`,
      "fetchFromWiktionary()",
    );
    throw new DictionaryError(ErrorType.Failed);
  }

  return parseWiktionaryData(data, word);
};

export const getData = async (
  word: string,
): Promise<DictionaryEntry[] | DictionaryErrorJSON> => {
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

      try {
        return await fetchFromWiktionary(word);
      } catch (error) {
        if (error instanceof DictionaryError) {
          if (error.type !== ErrorType.NotFound) {
            log(
              LOG_LEVEL.ERROR,
              `Error fetching data from Wiktionary for ${word}: ${error.type}`,
              "getData()",
            );
          }

          return serialiseError(error);
        } else {
          log(
            LOG_LEVEL.ERROR,
            `Unknown error fetching data from Wiktionary for ${word}`,
            "getData()",
          );
          return serialiseError(new DictionaryError(ErrorType.Failed));
        }
      }
    } else {
      return serialiseError(new DictionaryError(ErrorType.Failed));
    }
  }

  const data = await res.json();
  return data;
};
