import { logger } from '@lib/logger';

type ProjectItemValue = {
    v: boolean;
    i: string;
    t: number;
    p: unknown[];
    r: unknown[];
}

type ProjectConfig = {
    /** Entity identifier */
    httpETag: string;
    /** ConfigCat config */
    configJSON: Record<string, ProjectItemValue>;
    /** Timestamp in milliseconds */
    timestamp: number;
}

const memoryCache = {
    cache: new Map<string, ProjectConfig>(),
    set(key: string, config: ProjectConfig) {
        this.cache.set(key, config);
    },
    get(key: string): ProjectConfig | undefined {
        return this.cache.get(key);
    }
}

class LazyLoadConfigCat {
    public requestTimeoutMs = 30000;
    public clientVersion: string = "l-0.1";
    public baseUrl = "https://cdn.configcat.com";
    private cacheTimeToLiveSeconds = 60;
    private route: string;

    constructor(options?: { requestTimeoutMs?: number }) {
        if (options?.requestTimeoutMs) {
            if (options.requestTimeoutMs < 0) {
                throw new Error("Invalid 'requestTimeoutMs' value");
            }
            this.requestTimeoutMs = options.requestTimeoutMs;
        }

        this.route = `${this.baseUrl}/configuration-files/${process.env.CONFIG_CAT_KEY}/config_v4.json`;
    }

    public async getValue(key: string, defaultValue: boolean | string | number, user?: object) {
        const config = await this.getConfig();

        return config.configJSON[key]?.v ?? defaultValue;

    }

    private async refreshLogic(lastConfig?: ProjectConfig): Promise<ProjectConfig> {
        const config = await this.fetcher(lastConfig);

        if (!config) throw new Error("Failed to get config");

        memoryCache.set(process.env.CONFIG_CAT_KEY, config);
        return config;
    }

    private async getConfig() {

        let p = memoryCache.get(process.env.CONFIG_CAT_KEY);

        if (p && p.timestamp + (this.cacheTimeToLiveSeconds * 1000) > new Date().getTime()) {
            return p;
        }

        return this.refreshLogic(p);
    }

    private async fetcher(lastConfig?: ProjectConfig): Promise<ProjectConfig | undefined> {
        try {
            logger.debug("Fetch feature flags");

            const headers = new Headers({
                "User-Agent": `ConfigCat-MRJ/${this.clientVersion}`,
                "X-ConfigCat-UserAgent": `ConfigCat-MRJ/${this.clientVersion}`
            });

            if (lastConfig && lastConfig.httpETag) {
                headers.set("If-None-Match", lastConfig.httpETag);
            }

            const response = await fetch(this.route, { headers });

            if (!response.ok) throw response;

            const data = await response.json();

            logger.debug(data, "Feature flag config");

            if (response.status === 200) {
                const etag = response.headers.get("etag");
                if (!etag) throw new Error("Failed to get etag");
                return {
                    timestamp: new Date().getTime(),
                    configJSON: data as Record<string, ProjectItemValue>,
                    httpETag: etag
                }
            }

            if (response.status === 304) {
                const etag = response.headers.get("etag");
                if (!etag) throw new Error("Failed to get etag");
                if (!lastConfig) throw new Error("Previous config was not set.");
                return {
                    configJSON: lastConfig.configJSON,
                    timestamp: new Date().getTime(),
                    httpETag: etag
                };
            }

            logger.error(`1Failed to download feature flags & settings from ConfigCat. Status: ${response && response.status} - ${response && response.statusText}`);
            logger.info("Double-check your SDK Key on https://app.configcat.com/sdkkey");
            return lastConfig;
        } catch (error) {
            const message = error instanceof Response ? error.statusText : error instanceof Error ? error.message : "";
            logger.error(error, `2Failed to download feature flags & settings from ConfigCat. Status: ${message}`);
            logger.info("Double-check your SDK Key on https://app.configcat.com/sdkkey");
            return lastConfig;
        }
    }
}

declare global {
    // eslint-disable-next-line no-var
    var configCat: LazyLoadConfigCat;
}

let configCat: LazyLoadConfigCat;


if (process.env.VERCEL_ENV !== "development") {
    configCat = new LazyLoadConfigCat();
} else {
    if (!global.configCat) {
        global.configCat = new LazyLoadConfigCat();
    }
    configCat = global.configCat;
}

export default configCat;