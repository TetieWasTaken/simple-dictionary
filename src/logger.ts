"use server";

import { ACTIVE_LOG_LEVEL, LOG_LEVEL } from "./constants";

const getColour = async (level: LOG_LEVEL) => {
  switch (level) {
    case LOG_LEVEL.DEBUG:
      return "\x1b[34m";
    case LOG_LEVEL.INFO:
      return "\x1b[32m";
    case LOG_LEVEL.WARN:
      return "\x1b[33m";
    case LOG_LEVEL.ERROR:
      return "\x1b[31m";
    default:
      return "\x1b[37m";
  }
};

const colourCache: { [key in LOG_LEVEL]?: string } = {};

export async function log(level: LOG_LEVEL, message: string, source: string) {
  if (level >= ACTIVE_LOG_LEVEL) {
    let colour = colourCache[level];
    if (!colour) {
      colour = await getColour(level);
      colourCache[level] = colour;
    }
    const timestamp = new Date().toISOString();
    console.log(`${colour}[${timestamp}] [${source}] ${message}\x1b[0m`);
  }
}
