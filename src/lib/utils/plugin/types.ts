export type FirstInstallationParamerters = {};
export type VaildConfig = {
  storefronts: {
    type: string;
    token: string;
    label: string;
    domain: string;
  }[];
  keyToken: string;
  paramsVersion: "7";
  autoApplyToFieldsWithApiKey: string;
};

export type Config = VaildConfig | FirstInstallationParamerters;

export function isVaildConfig(params: Config): params is VaildConfig {
  return params && "paramsVersion" in params && params.paramsVersion === "7";
}

export function normalizeConfig(params: Config): VaildConfig {
  if (isVaildConfig(params)) return params;

  return {
    paramsVersion: "7",
    storefronts: [],
    keyToken: "",
    autoApplyToFieldsWithApiKey: "",
  };
}
