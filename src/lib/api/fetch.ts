/**
 * Fetch that throws on 400 errors and parses responce
 */
export const singleFetch = (url: string) =>
  fetch(url)
    .then((e) => {
      if (e.ok) return e;
      throw e;
    })
    .then((r) => r.json());
