"use server";

import { DictionaryError, ErrorType } from "./error";

export const getData = async (word: string) => {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${
      encodeURIComponent(word)
    }`,
  );

  console.log(res);

  if (!res.ok) {
    if (res.statusText === "Not Found") {
      throw new DictionaryError(ErrorType.NotFound);
    } else {
      throw new DictionaryError(ErrorType.Failed);
    }
  }

  const data = await res.json();
  return data;
};
