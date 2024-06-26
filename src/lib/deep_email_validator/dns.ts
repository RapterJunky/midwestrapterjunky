import type { MxRecord } from "node:dns";
import { resolveMx } from "node:dns/promises";

/**
 * @see https://github.com/mfbx9da4/deep-email-validator/blob/master/src/dns/dns.ts
 *
 * @export
 * @param {string} domain
 * @return {*}  {Promise<MxRecord>}
 */
export async function getBestMx(domain: string): Promise<MxRecord> {
  const addresses = await resolveMx(domain).catch((e) => {
    throw new Error("Failed to validate mailbox", {
      cause: (e as Error)?.message ?? "Unknown error",
    });
  });
  let bestIndex = 0;

  for (let i = 0; i < addresses.length; i++) {
    const current = addresses.at(i)?.priority ?? 0;
    const best = addresses.at(bestIndex)?.priority ?? 0;

    if (current < best) {
      bestIndex = i;
    }
  }

  const best = addresses[bestIndex];

  if (!best) throw new Error("MX record not found.");

  return best;
}
