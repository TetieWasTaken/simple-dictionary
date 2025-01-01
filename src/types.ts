// todo: check if all available fields are used

interface Phonetics {
  text: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

export interface Definition {
  definition: string; // | object?
  example: string;
  examples?: string[];
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  language?: string;
}

export interface License {
  name: string;
  url: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetics[];
  origin: string;
  meanings: Meaning[];
  license: License;
  source: string;
  sourceUrls: string[];
  isManualSearch?: boolean;
}

export interface AutocompleteResult {
  words: string[];
  performance: number;
}

interface WikitionaryDefinition {
  definition: string;
  parsedExamples?: Record<string, string>[];
  examples?: string[];
}

export interface WikitionaryEntry {
  partOfSpeech: string;
  language: string;
  definitions: WikitionaryDefinition[];
}
