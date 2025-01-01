"use server";

import { promises as fs } from "fs";
import { distance } from "fastest-levenshtein";

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

      const nextNode = node.children.get(char);

      if (!nextNode) {
        throw new Error("Node not found");
      }

      node = nextNode;
    }

    node.isEnd = true;
  }

  private _getWords(node: TrieNode, prefix: string) {
    // console.log("Getting words with prefix", prefix);

    const words: string[] = [];
    if (node.isEnd) {
      words.push(prefix);
    }

    for (const [char, nextNode] of node.children) {
      if (!nextNode) {
        continue;
      }

      words.push(...this._getWords(nextNode, prefix + char));
    }

    return words;
  }

  /*
  private _getWords(node: TrieNode, prefix: string, maxResults: number = 10): string[] {
    console.log("Getting words with prefix", prefix);

    const words: string[] = [];
    const stack: [TrieNode, string][] = [[node, prefix]];

    while (stack.length > 0) {
      const [currentNode, currentPrefix] = stack.pop()!;
      if (currentNode.isEnd) {
        words.push(currentPrefix);
        if (words.length >= maxResults) {
          break;
        }
      }
      for (const [char, nextNode] of currentNode.children) {
        if (nextNode) {
          stack.push([nextNode, currentPrefix + char]);
        }
      }
    }

    return words;
  }
  */

  getWordsByPrefix(prefix: string) {
    // console.log("Getting words by prefix", prefix);

    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return [];
      }

      const nextNode = node.children.get(char);

      if (!nextNode) {
        return [];
      }

      node = nextNode;
    }

    return this._getWords(node, prefix);
  }
}

export default Trie;

const minTrie: Trie = new Trie();
const medTrie: Trie = new Trie();
const maxTrie: Trie = new Trie();

export async function buildTrie() {
  const startPerformance = performance.now();

  const files = [
    { filePath: "/src/10k_words.txt", trie: minTrie },
    { filePath: "/src/100k_words.txt", trie: medTrie },
    { filePath: "/src/530k_words.txt", trie: maxTrie },
  ];

  try {
    const fileContents = await Promise.all(
      files.map(({ filePath }) =>
        fs.readFile(process.cwd() + filePath, "utf-8")
      ),
    );

    fileContents.forEach((content, index) => {
      const lines = content.split("\n");
      lines.forEach((line) => {
        files[index].trie.insert(line);
      });
    });
  } catch (err) {
    console.error(err);
  }

  const endPerformance = performance.now();
  console.log("Time taken to build trie", endPerformance - startPerformance);
}

export async function getAutoComplete(word: string) {
  if (!word) {
    return;
  }

  if (!minTrie && !medTrie && !maxTrie) {
    console.log("Trie not built");
    return;
  }

  const perfStart = performance.now();
  const tries = [minTrie, medTrie, maxTrie];
  let words: string[] = [];

  for (const trie of tries) {
    const trieWords = trie.getWordsByPrefix(word);
    words = [...new Set([...words, ...trieWords])];
    if (words.length >= 5) break;

    if (trie === minTrie) {
      const allWords = trie.getWordsByPrefix("");
      const closeWords = allWords.filter((w) => distance(w, word) <= 1);
      words = [...new Set([...words, ...closeWords])];

      if (words.length >= 5) break;
    }
  }

  if (words.length === 0) {
    console.log("No words found");
    return;
  }

  const closestWords = words
    .map((w) => ({ word: w, dist: distance(w, word) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)
    .map((w) => w.word);

  const perfEnd = performance.now();

  return { words: closestWords, performance: perfEnd - perfStart };
}
