import * as fs from "node:fs";
import * as path from "node:path";
import { getData } from "./src/getData";

const loadFile = (filePath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.split("\n"));
      }
    });
  });
};

const loadDictionaries = async () => {
  try {
    const basePath = process.cwd() + "/public/dictionary/";
    const files = ["10k_words.txt", "100k_words.txt", "530k_words.txt"];

    const promises = files.map((file) => loadFile(path.join(basePath, file)));
    const [words10k, words100k, words530k] = await Promise.all(promises);

    return {
      words10k,
    };
  } catch (error) {
    console.error("Error loading dictionaries:", error);
  }
};

const storeWord = async (word: string, isInDictionary: boolean) => {
  const filePath = process.cwd() + "/filtered_words.json";
  let data = [];
  try {
    data = JSON.parse(
      await fs.promises.readFile(filePath, "utf-8"),
    );
  } catch (error) {
    console.error("Error reading file:", error);
  }

  data.push({ word, isInDictionary });

  try {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing file:", error);
  }

  console.log(`Stored word: ${word}`);

  return data;
};

const startIndex = async () => {
  const filePath = process.cwd() + "/filtered_words.json";
  let data = [];
  try {
    data = JSON.parse(
      await fs.promises
        .readFile(filePath, "utf-8"),
    );
  } catch (error) {
    console.error("Error reading file:", error);
  }

  return data.length;
};

const main = async () => {
  const dictionaries = await loadDictionaries();
  if (!dictionaries) {
    return;
  }
  const words10k = dictionaries.words10k;

  const start = await startIndex();

  for (let i = start; i < words10k.length; i++) {
    const word = words10k[i].trim();

    try {
      const meanings = await getData(word, process.cwd());
      if ("error" in meanings) {
        console.log("Not in dictionary:", word);
        await storeWord(word, false);
      } else {
        console.log("In dictionary:", word);
        await storeWord(word, true);
      }
    } catch (error) {
      console.error(`Error fetching data for word: ${word}`, error);
      await storeWord(word, false);
    }

    console.log(`Progress: ${i + 1}/${words10k.length}`);
    console.log(`ETA: ${((words10k.length - i - 1) * 0.75) / 60} minutes`);
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
};

const storeWords = async () => {
  // Store all words  in filtered_words.json that have isInDictionary as true in words.txt file or if isInDictionary is false then check capitalised.txt, if it is present in capitalised.txt then store it in words.txt
  const filePath = process.cwd() + "/filtered_words.json";
  let data = [];
  try {
    data = JSON.parse(
      await fs.promises
        .readFile(filePath, "utf-8"),
    );
  } catch (error) {
    console.error("Error reading file:", error);
  }

  interface WordData {
    word: string;
    isInDictionary: boolean;
  }

  const words: string[] = data.filter((word: WordData) => word.isInDictionary)
    .map((word: WordData) => word.word);
  const notWords: string[] = data.filter((word: WordData) =>
    !word.isInDictionary
  ).map((word: WordData) => word.word);

  const capitalisedPath = process.cwd() +
    "/public/dictionary/capitalised.txt";
  let capitalised: string[] = [];
  try {
    capitalised = (await fs.promises
      .readFile(capitalisedPath, "utf-8")).split("\n");
  } catch (error) {
    console.error("Error reading file:", error);
  }

  console.log("Capitalised words:", capitalised);

  // convert all capitalised words to lowercase
  capitalised = capitalised.map((word) => word.toLowerCase());

  notWords.forEach((word) => {
    if (capitalised.includes(word)) {
      words.push(word);
    }
  });

  const wordsPath = process.cwd() + "/words.txt";

  try {
    await fs.promises.writeFile(wordsPath, words.join("\n"));
  } catch (error) {
    console.error("Error writing file:", error);
  }

  console.log("Stored words in words.txt");
};

storeWords();
