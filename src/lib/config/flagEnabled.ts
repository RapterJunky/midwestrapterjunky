import type { Flags } from "@lib/config/flags";
import configCat from "@api/configCat";

const flagEnabled = async (flag: Flags) => {
  if (process.env.NEXT_PUBLIC_FEATURE_FLAGS.includes(flag)) {
    return true;
  }

  return configCat.getValue(flag, false);
};

export default flagEnabled;
