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

let currentTrie: Trie | undefined;

export async function buildTrie() {
  const startPerformance = performance.now();
  const trie = new Trie();

  const file = process.cwd() + "/src/dictionary.txt";

  try {
    const data = await fs.readFile(file, "utf-8");
    const lines = data.split("\n");

    for (const line of lines) {
      trie.insert(line.trim());
    }

    currentTrie = trie;
  } catch (err) {
    console.error(err);
  }

  const endPerformance = performance.now();

  console.log("Time taken to build trie", endPerformance - startPerformance);
}

export async function getAutoComplete(word: string) {
  if (!currentTrie) {
    return;
  }

  const start = performance.now();
  const words = currentTrie.getWordsByPrefix(word);
  const end = performance.now();

  console.log("Time taken to get words", end - start);

  if (!words || words.length === 0) {
    console.log("No words found");
    return;
  }

  const closestStart = performance.now();
  const closestWords = words
    .map((w) => ({ word: w, dist: distance(w, word) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5)
    .map((w) => w.word);
  const closestEnd = performance.now();
  console.log("Time taken to get closest words", closestEnd - closestStart);

  return closestWords;
}
