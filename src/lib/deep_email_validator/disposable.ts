/**
 * @see https://www.npmjs.com/package/disposable-email-domains
 *
 * An always-up-to-date version of this repo is provided as an API by Kickbox.
 * Issuing a GET request to https://open.kickbox.com/v1/disposable/{DomainOrEmailAddress}
 * will return {"disposable":true} or {"disposable":false} as a JSON response.
 *
 * @export
 * @param {string} email
 * @return {*}  {(Promise<void>)}
 */
export default async function checkDisposable(email: string): Promise<void> {
  try {
    const res = await fetch(
      `https://open.kickbox.com/v1/disposable/${encodeURIComponent(email)}`,
    );

    if (!res.ok) throw new Error();

    const data = (await res.json()) as { disposable: boolean };
    if (data.disposable) throw new Error();
  } catch (_error) {
    throw new Error("Email was created using a disposable email service.");
  }
}
