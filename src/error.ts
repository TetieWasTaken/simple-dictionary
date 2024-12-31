export enum ErrorType {
  NotFound = "Word not found",
  Failed = "Failed to fetch data",
}

export class DictionaryError extends Error {
  public message: string;

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
        return "There was an error fetching the data. Please try again.";
      default:
        return "An unknown error occurred.";
    }
  }
}
