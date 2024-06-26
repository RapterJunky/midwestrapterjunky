import type { ProjectConfig } from "./types";

//import { logger } from "@lib/logger";

export type ValueAndVariationId<TDefault extends string | boolean | number> = {
  value: TDefault;
  variationId: TDefault | undefined;
};

export class User {
  constructor(
    public identifier: string,
    public email?: string,
    public country?: string,
    public custom: Record<string, string> = {},
  ) {}
}

export function RolloutEvaluate<TDefault extends string | boolean | number>(
  config: ProjectConfig<TDefault> | null,
  key: string,
  defaultValue: TDefault,
  _user?: User,
  defaultVariationId?: TDefault,
): ValueAndVariationId<TDefault> | null {
  if (!config || !config.configJSON) {
    console.error(
      { defaultValue, defaultVariationId },
      "JSONConfig is not present. Returning default values",
    );
    return { value: defaultValue, variationId: defaultVariationId };
  }

  if (!config.configJSON[key]) {
    console.error(
      config,
      `Evaluating getValue(${key}) failed. Returning default value '${JSON.stringify(
        defaultValue,
      )}'`,
    );
    return { value: defaultValue, variationId: defaultVariationId };
  }

  return {
    value: config.configJSON[key]?.v ?? defaultValue,
    variationId: config.configJSON[key]?.i ?? defaultVariationId,
  };
}
