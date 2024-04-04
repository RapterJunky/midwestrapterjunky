import { POPULAR_TLDS, run } from "@zootools/email-spell-checker";

export async function checkTypo(
  email: string,
  additionalDomains?: string[],
): Promise<void> {
  const topLevelDomains =
    additionalDomains && additionalDomains.length > 0
      ? [...POPULAR_TLDS, ...additionalDomains]
      : undefined;

  return new Promise<void>((ok, err) => {
    run({
      email,
      topLevelDomains,
      suggested(suggestion) {
        err(new Error(`Likely typo, suggested email: ${suggestion?.full}`));
      },
      empty() {
        ok();
      },
    });
  });
}
