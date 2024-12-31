interface Phonetics {
  text: string;
  audio?: string;
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
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetics[];
  origin: string;
  meanings: Meaning[];
}
