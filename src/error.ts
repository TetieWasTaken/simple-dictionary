import { DictionaryErrorJSON } from "./types";

export enum ErrorType {
  NotFound = "Word not found",
  Failed = "Failed to fetch data",
}

export class DictionaryError extends Error {
  constructor(public type: ErrorType) {
    super(type);
    this.name = "DictionaryError";
    this.message = this._getMessage(type);
    Object.setPrototypeOf(this, DictionaryError.prototype);
  }

  private _getMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.NotFound:
        return "The word you are looking for could not be found.";
      case ErrorType.Failed:
        return "There was an error fetching the data. Please try again later or opening an issue on GitHub.";
      default:
        return "An unknown error occurred. Please try again later or opening an issue on GitHub.";
    }
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
