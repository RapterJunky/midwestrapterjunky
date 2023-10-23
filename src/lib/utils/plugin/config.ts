export type StorefrontPluginConfig = {
  type: Storefront.StorefrontType;
  token: string;
  label: string;
  test: boolean;
  domain: string;
};

export type VaildConfig = {
  siteUrl: string;
  previewPath: string;
  previewSecret?: string;
  storefronts: StorefrontPluginConfig[];
  keyToken: string;
  paramsVersion: "9";
  autoApplyToFieldsWithApiKey: string;
  revalidateToken: string;
};

export type Config = VaildConfig | Partial<VaildConfig>;

export function isVaildConfig(params: Config): params is VaildConfig {
  return params && "paramsVersion" in params && params.paramsVersion === "9";
}

export function normalizeConfig(params: Config): VaildConfig {
  if (isVaildConfig(params)) return params;

  return {
    revalidateToken: params?.revalidateToken ?? "",
    siteUrl: params?.siteUrl ?? "",
    previewPath: params?.previewPath ?? "",
    previewSecret: params?.previewSecret,
    paramsVersion: "9",
    storefronts: params?.storefronts ?? [],
    keyToken: params?.keyToken ?? "",
    autoApplyToFieldsWithApiKey: params.autoApplyToFieldsWithApiKey ?? "",
  };
}
