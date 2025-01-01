import { LogLevel } from "./logger";

export const LOOKUP_SYNONYMS = [
  "research",
  "find",
  "search for",
  "hunt for",
  "track down",
  "seek out",
  "discover",
  "turn up",
  "uncover",
  "unearth",
  "spot",
  "expose",
  "come up with",
  "locate",
  "detect",
  "come across",
  "come upon",
  "catch sight of",
  "stumble upon",
  "hit upon",
  "espy",
  "ferret out",
  "chance upon",
  "light upon",
  "put your finger on",
  "lay your hand on",
  "run to ground",
  "run to earth",
  "descry",
  "peruse",
  "scan",
];

export const WIKITIONARY_RATE_LIMIT = 200;
export enum LOG_LEVEL {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}
export const ACTIVE_LOG_LEVEL = LOG_LEVEL.DEBUG;
