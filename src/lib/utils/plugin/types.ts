export type VaildConfig = {
  siteUrl: string;
  previewPath: string;
  previewSecret?: string;
  storefronts: {
    type: string;
    token: string;
    label: string;
    domain: string;
  }[];
  keyToken: string;
  paramsVersion: "8";
  autoApplyToFieldsWithApiKey: string;
};

export type Config = VaildConfig | Partial<VaildConfig>;

export function isVaildConfig(params: Config): params is VaildConfig {
  return params && "paramsVersion" in params && params.paramsVersion === "8";
}

export function normalizeConfig(params: Config): VaildConfig {
  if (isVaildConfig(params)) return params;

  return {
    siteUrl: params?.siteUrl ?? "",
    previewPath: params?.previewPath ?? "",
    previewSecret: params?.previewSecret,
    paramsVersion: "8",
    storefronts: params?.storefronts ?? [],
    keyToken: params?.keyToken ?? "",
    autoApplyToFieldsWithApiKey: params.autoApplyToFieldsWithApiKey ?? "",
  };
}
