import type { Flags } from "./flags";
export const hasFlag = (flag: Flags) => process.env.NEXT_PUBLIC_FEATURE_FLAGS.split(",").includes(flag);