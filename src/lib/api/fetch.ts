/**
 * Fetch that throws on 400 errors and parses responce
 */
export const singleFetch = <T = unknown>(url: string, init?: RequestInit) =>
  fetch(url, init)
    .then((e) => {
      if (e.ok) return e;
      throw e;
    })
    .then((r) => r.json() as Promise<T>);
