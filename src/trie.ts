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

  toJSON() {
    return {
      children: Array.from(this.children.entries()),
      isEnd: this.isEnd,
    };
  }

  static fromJSON(json: any) {
    const node = new TrieNode();
    node.isEnd = json.isEnd;
    node.children = new Map(
      json.children.map((
        [key, value]: [string, any],
      ) => [key, TrieNode.fromJSON(value)]),
    );
    return node;
  }
}

class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  toJSON() {
    return this.root;
  }

  static fromJSON(json: any) {
    const trie = new Trie();
    trie.root = TrieNode.fromJSON(json);
    return trie;
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

  search(word: string) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        return false;
      }

      const nextNode = node.children.get(char);

      if (!nextNode) {
        return false;
      }

      node = nextNode;
    }

    return node.isEnd;
  }

  startsWith(prefix: string) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return false;
      }

      const nextNode = node.children.get(char);

      if (!nextNode) {
        return false;
      }

      node = nextNode;
    }

    return true;
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

console.log("Building trie");
const startPerformance = performance.now();
const currentTrie = await buildTrie("dictionary.txt");
const endPerformance = performance.now();
console.log("Time taken to build trie", endPerformance - startPerformance);

export async function buildTrie(file: string) {
  const trie = new Trie();

  file = process.cwd() + "/src/" + file;

  try {
    const data = await fs.readFile(file, "utf-8");
    const lines = data.split("\n");

    for (const line of lines) {
      trie.insert(line.trim());
    }

    /* await fs.writeFile(
      process.cwd() + "/src/trie.json",
      JSON.stringify(trie.toJSON()),
      "utf-8",
    ); */

    return trie;
  } catch (err) {
    console.error(err);
  }
}

export async function loadTrie() {
  try {
    const data = await fs.readFile(process.cwd() + "/src/trie.json", "utf-8");
    const json = JSON.parse(data);
    return Trie.fromJSON(json);
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAutoComplete(word: string) {
  const trieStart = performance.now();
  //const trie = await loadTrie();
  const trie = currentTrie;
  const trieEnd = performance.now();

  console.log("Time taken to load trie", trieEnd - trieStart);

  if (!trie) {
    return;
  }

  const start = performance.now();
  const words = trie.getWordsByPrefix(word);
  const end = performance.now();

  console.log("Time taken to get words", end - start);

  if (!words) {
    return;
  }

  const closestStart = performance.now();
  const closestWord = words.reduce((acc, curr) => {
    if (distance(curr, word) < distance(acc, word)) {
      return curr;
    }

    return acc;
  });
  const closestEnd = performance.now();
  console.log("Time taken to get closest word", closestEnd - closestStart);

  return closestWord;
}
