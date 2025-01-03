"use server";

import { DictionaryError, ErrorType } from "./error";
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
    `Parsing Wiktionary data for word: ${word}`,
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

  log(
    LOG_LEVEL.DEBUG,
    `Parsed ${meanings.length} meanings for word: ${word}`,
    "parseWiktionaryData()",
  );

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

let capitalisedWords: string[] = [];

const fetchFromWiktionary = async (
  word: string,
  isRecursion = false,
): Promise<DictionaryEntry[]> => {
  log(
    LOG_LEVEL.INFO,
    `Fetching data from Wiktionary for word: ${word}`,
    "fetchFromWiktionary()",
  );

  if (capitalisedWords.length === 0) {
    const fs = (await import("fs")).promises;
    const capitalised = await fs.readFile(
      process.cwd() +
        "/src/contents/dictionary/capitalised.txt",
      "utf-8",
    );
    capitalisedWords = capitalised.split("\n");
  }

  const capitalisedWord = capitalisedWords.find((w) =>
    w.toLowerCase() === word
  );

  if (capitalisedWord) {
    log(
      LOG_LEVEL.DEBUG,
      `Word is capitalised. Fetching data instead for word: ${capitalisedWord}`,
      "fetchFromWiktionary()",
    );
    return await fetchFromWiktionary(capitalisedWord, true);
  }

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
        `Word not found in Wiktionary for word: ${word}`,
        "fetchFromWiktionary()",
      );

      if (!isRecursion) {
        const capitalisedWord = word.charAt(0).toUpperCase() + word.slice(1);
        return await fetchFromWiktionary(capitalisedWord, true);
      }

      throw new DictionaryError(ErrorType.NotFound);
    } else {
      log(
        LOG_LEVEL.WARN,
        `Status ${res.status} for Wiktionary request for word: ${word}`,
        "fetchFromWiktionary()",
      );
      throw new DictionaryError(ErrorType.Failed);
    }
  }

  const data = await res.json();

  if (!data) {
    log(
      LOG_LEVEL.WARN,
      `No data found in Wiktionary for word: ${word}`,
      "fetchFromWiktionary()",
    );
    throw new DictionaryError(ErrorType.Failed);
  }

  log(
    LOG_LEVEL.INFO,
    `Data fetched successfully from Wiktionary for word: ${word}`,
    "fetchFromWiktionary()",
  );

  return parseWiktionaryData(data, word);
};

export const getData = async (
  word: string,
): Promise<DictionaryEntry[] | DictionaryErrorJSON> => {
  log(
    LOG_LEVEL.INFO,
    `Fetching data from dictionary API for word: ${word}`,
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
        `Word not found in dictionary API for word: ${word}`,
        "getData()",
      );

      try {
        return await fetchFromWiktionary(word);
      } catch (error) {
        const serialiseError = (await import("./error")).serialiseError;
        if (error instanceof DictionaryError) {
          if (error.type !== ErrorType.NotFound) {
            log(
              LOG_LEVEL.ERROR,
              `Error fetching data from Wiktionary for word: ${word}: ${error.type}`,
              "getData()",
            );
          }
          return serialiseError(error);
        } else {
          log(
            LOG_LEVEL.ERROR,
            `Unknown error fetching data from Wiktionary for word: ${word}`,
            "getData()",
          );
          console.error(error);
          return serialiseError(new DictionaryError(ErrorType.Failed));
        }
      }
    } else {
      const serialiseError = (await import("./error")).serialiseError;
      log(
        LOG_LEVEL.ERROR,
        `Failed to fetch data from dictionary API for word: ${word}. Status: ${res.status}`,
        "getData()",
      );
      return serialiseError(new DictionaryError(ErrorType.Failed));
    }
  }

  const data = await res.json() as DictionaryEntry[];
  log(
    LOG_LEVEL.INFO,
    `Data fetched successfully from dictionary API for word: ${word}`,
    "getData()",
  );

  data.forEach((entry) => {
    entry.inaccurate = entry.sourceUrls.length > 1;
  });

  data.sort((a, b) => {
    if (a.inaccurate && !b.inaccurate) return 1;
    if (!a.inaccurate && b.inaccurate) return -1;
    return 0;
  });

  return data;
};
