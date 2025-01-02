"use server";

import { promises as fs } from "fs";
import { distance } from "fastest-levenshtein";
import { log } from "./logger";
import { LOG_LEVEL } from "./constants";

class TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;

  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }

  private _getWords(node: TrieNode, prefix: string): string[] {
    const words: string[] = [];
    if (node.isEnd) {
      words.push(prefix);
    }
    for (const [char, nextNode] of node.children) {
      words.push(...this._getWords(nextNode, prefix + char));
    }
    return words;
  }

  getWordsByPrefix(prefix: string): string[] {
    log(
      LOG_LEVEL.DEBUG,
      `Getting words with prefix ${prefix}`,
      "Trie.getWordsByPrefix()",
    );
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }
    return this._getWords(node, prefix);
  }
}

export default Trie;

const minTrie = new Trie();
const medTrie = new Trie();
const maxTrie = new Trie();

// todo: have a pre-built trie
export async function buildTrie() {
  if (
    minTrie.root.children.size > 0 && medTrie.root.children.size > 0 &&
    maxTrie.root.children.size > 0
  ) {
    log(LOG_LEVEL.DEBUG, "Trie already built", "buildTrie()");
    return;
  }

  log(LOG_LEVEL.INFO, "Building trie", "buildTrie()");
  const startPerformance = performance.now();

  const files = [
    { filePath: "/src/10k_words.txt", trie: minTrie },
    { filePath: "/src/100k_words.txt", trie: medTrie },
    { filePath: "/src/530k_words.txt", trie: maxTrie },
  ];

  try {
    log(LOG_LEVEL.DEBUG, "Reading files", "buildTrie()");
    const fileContents = await Promise.all(
      files.map(({ filePath }) =>
        fs.readFile(process.cwd() + filePath, "utf-8")
      ),
    );

    log(LOG_LEVEL.DEBUG, "Inserting words into trie", "buildTrie()");
    await Promise.all(fileContents.map((content, index) => {
      const lines = content.split("\n");
      lines.forEach((line) => files[index].trie.insert(line));
    }));
  } catch (err) {
    log(LOG_LEVEL.ERROR, `Error building trie: ${err}`, "buildTrie()");
  }

  const endPerformance = performance.now();
  log(
    LOG_LEVEL.DEBUG,
    `Trie built in ${endPerformance - startPerformance}ms`,
    "buildTrie()",
  );
}

// todo: filter out words that don't exist in the dictionary
export async function getAutoComplete(word: string) {
  if (!word) {
    return;
  }

  if (
    minTrie.root.children.size === 0 && medTrie.root.children.size === 0 &&
    maxTrie.root.children.size === 0
  ) {
    log(LOG_LEVEL.DEBUG, "Trie not built", "getAutoComplete()");
    return;
  }

  log(LOG_LEVEL.DEBUG, `Getting autocomplete for ${word}`, "getAutoComplete()");
  const perfStart = performance.now();

  const tries = [minTrie, medTrie, maxTrie];
  let words: string[] = [];

  for (const trie of tries) {
    const trieWords = trie.getWordsByPrefix(word).filter((w) => w !== word);
    words = [...new Set([...words, ...trieWords])];
    if (words.length >= 5) break;

    if (trie === minTrie) {
      const allWords = trie.getWordsByPrefix("").filter((w) => w !== word);
      const closeWords = allWords.filter((w) => distance(w, word) <= 1);
      words = [...new Set([...words, ...closeWords])];

      if (words.length === 0) {
        const closeWords = allWords.filter((w) => distance(w, word) <= 2);
        words = [...new Set([...words, ...closeWords])];
      }

      if (words.length >= 5) break;
    }
  }

  if (words.length === 0) {
    return;
  }

  log(LOG_LEVEL.DEBUG, `Found ${words.length} words`, "getAutoComplete()");
  const closestWords = words.map((w) => ({ word: w, dist: distance(w, word) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)
    .map((w) => w.word);

  const perfEnd = performance.now();
  log(
    LOG_LEVEL.DEBUG,
    `Autocomplete found in ${perfEnd - perfStart}ms`,
    "getAutoComplete()",
  );

  return { words: closestWords, performance: perfEnd - perfStart };
}
