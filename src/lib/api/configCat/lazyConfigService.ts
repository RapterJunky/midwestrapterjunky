import { Cache } from "./cache";
import ConfigServiceBase, { ConfigFetcher } from "./configServiceBase";
import type { ProjectConfig } from "./types";

export default class LazyConfigService extends ConfigServiceBase implements ConfigFetcher {
    private cacheTimeToLiveSeconds: number = 60;
    constructor(cache: Cache) {
        super(cache);

        if (this.cacheTimeToLiveSeconds < 1) {
            throw new Error("Invalid 'cacheTimeToLiveSeconds' value. Value must be greater than zero.");
        }
    }

    async getConfig<T extends string | boolean | number>(): Promise<ProjectConfig<T> | null> {
        const config = await this.cache.get(process.env.CONFIG_CAT_KEY);

        if (config && config.timestamp + this.cacheTimeToLiveSeconds * 1000 > new Date().getTime()) {
            return config as ProjectConfig<T>;
        }

        return this.refresh<T>(config as ProjectConfig<T> | null);
    }
}