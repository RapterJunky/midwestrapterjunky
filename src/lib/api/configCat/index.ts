import { ConfigCatClient } from "./client";
import LazyConfigService from "./lazyConfigService";
import { InMemoryCache, KVCache } from "./cache";

type Global = typeof globalThis & { configCat: ConfigCatClient };

let configCat: ConfigCatClient;

const getClient = () =>
  new ConfigCatClient(
    new LazyConfigService(
      process.env.CONFIG_CAT_CACHE === "kv"
        ? new KVCache()
        : new InMemoryCache()
    )
  );

if (process.env.VERCEL_ENV !== "development") {
  configCat = getClient();
} else {
  if (!(global as Global).configCat) {
    (global as Global).configCat = getClient();
  }
  configCat = (global as Global).configCat;
}

export default configCat;
