import { DictionaryErrorJSON } from "./types";

export enum ErrorType {
  NotFound = "Word not found",
  Failed = "Failed to fetch data",
}

export class DictionaryError extends Error {
  private static messages: Record<ErrorType, string> = {
    [ErrorType.NotFound]: "The word you are looking for could not be found.",
    [ErrorType.Failed]:
      "There was an error fetching the data. Please try again later or opening an issue on GitHub.",
  };

  constructor(public type: ErrorType) {
    super(
      DictionaryError.messages[type] ||
        "An unknown error occurred. Please try again later or opening an issue on GitHub.",
    );
    this.name = "DictionaryError";
    Object.setPrototypeOf(this, DictionaryError.prototype);
  }
}

export function serialiseError(error: DictionaryError): DictionaryErrorJSON {
  return {
    error: true,
    name: error.name,
    message: error.message,
    type: error.type,
  };
}
