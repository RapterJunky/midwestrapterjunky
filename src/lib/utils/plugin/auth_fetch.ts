export class RequestError extends Error {
  constructor(public response: Response, msg?: string) {
    super(msg, { cause: `FAILED_REQUEST_${response.statusText}` });
  }
}

/**
 *
 * @throws MISSING_AUTH_TOKEN
 * @throws FAILED_REQUEST_${statusText}
 */
export const AuthFetch = async (
  input: Request | string | URL,
  init?: (RequestInit & { json?: object, key?: string; }) | undefined
): Promise<Response> => {
  const token = new URLSearchParams(window.location.search).get("token")
  if (!token)
    throw new Error("Failed to fetch data.", {
      cause: "MISSING_AUTH_TOKEN",
    });

  const headers = new Headers(init?.headers);
  headers.append("Authorization", `Bearer ${init?.key ?? token}`);
  if (init?.json) {
    headers.append("Content-Type", "application/json");
  }

  const result = await fetch(input, {
    ...init,
    body: init?.json ? JSON.stringify(init?.json) : init?.body,
    headers,
  });

  if (!result.ok)
    throw new RequestError(result, "There was an error in the request");

  return result;
};
