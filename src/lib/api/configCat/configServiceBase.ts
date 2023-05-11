import type { Cache } from "./cache";
import type { ProjectConfig, ProjectConfigJSON } from "./types";
import { logger } from "@lib/logger";

export type ConfigFetcher = {
  getConfig<
    T extends string | boolean | number = boolean
  >(): Promise<ProjectConfig<T> | null>;
};

export default class ConfigServiceBase {
  private route = `https://cdn.configcat.com/configuration-files/${process.env.CONFIG_CAT_KEY}/config_v4.json`;
  constructor(protected cache: Cache) {}
  protected async fetch<T extends string | boolean | number = boolean>(
    lastConfig: ProjectConfig<T> | null,
    config?: RequestInit
  ): Promise<ProjectConfig<T> | null> {
    try {
      const clientVersion = "lazy-0.1.0";
      const headers = new Headers({
        "User-Agent": `ConfigCat-MRJ/${clientVersion}`,
        "X-ConfigCat-UserAgent": `ConfigCat-MRJ/${clientVersion}`,
      });

      if (lastConfig && lastConfig.httpETag) {
        headers.set("If-None-Match", lastConfig.httpETag);
      }

      const response = await fetch(this.route, { ...config, headers });
      if (!response.ok) throw response;

      const data = (await response.json()) as ProjectConfigJSON<T>;

      if (response.status === 200) {
        const etag = response.headers.get("etag");
        if (!etag) throw new Error("Failed to get etag");
        return {
          timestamp: new Date().getTime(),
          configJSON: data,
          httpETag: etag,
        };
      }

      if (response.status === 304) {
        const etag = response.headers.get("etag");
        if (!etag) throw new Error("Failed to get etag");
        if (!lastConfig) throw new Error("Previous config was not set.");
        return {
          configJSON: lastConfig.configJSON,
          timestamp: new Date().getTime(),
          httpETag: etag,
        };
      }

      logger.error(
        response,
        `Failed to download feature flags & settings from ConfigCat. Status: ${
          response && response.status
        } - ${response && response.statusText}`
      );
      logger.info(
        "Double-check your SDK Key on https://app.configcat.com/sdkkey"
      );
      return lastConfig;
    } catch (error) {
      const message =
        error instanceof Response
          ? error.statusText
          : error instanceof Error
          ? error.message
          : "";
      logger.error(
        error,
        `2Failed to download feature flags & settings from ConfigCat. Status: ${message}`
      );
      logger.info(
        "Double-check your SDK Key on https://app.configcat.com/sdkkey"
      );
      return lastConfig;
    }
  }
  protected async refresh<T extends string | boolean | number = boolean>(
    lastConfig: ProjectConfig<T> | null
  ): Promise<ProjectConfig<T> | null> {
    const config = await this.fetch<T>(lastConfig);
    if (!config) throw new Error("Failed to fetch config");
    this.cache.set(process.env.CONFIG_CAT_KEY, config);
    return config;
  }
}
