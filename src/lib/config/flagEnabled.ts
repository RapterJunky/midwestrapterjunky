import type { ValueAndVariationId } from "@api/configCat/rollout";
import type { Flags } from "@lib/config/flags";
import configCat from "@api/configCat";

const flagEnabled = async (
  flag: Flags,
): Promise<ValueAndVariationId<boolean> | null> => {
  if (process.env.NEXT_PUBLIC_FEATURE_FLAGS.includes(flag)) {
    return {
      value: true,
      variationId: undefined,
    };
  }

  return configCat.getValue(flag, false);
};

export default flagEnabled;
