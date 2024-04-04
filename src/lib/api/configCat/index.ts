import { InMemoryCache } from "./cache";
import { ConfigCatClient } from "./client";
import LazyConfigService from "./lazyConfigService";

type Global = typeof globalThis & { configCat: ConfigCatClient };

let configCat: ConfigCatClient;

const cache = new InMemoryCache();

const getClient = () => new ConfigCatClient(new LazyConfigService(cache));

if (process.env.VERCEL_ENV !== "development") {
  configCat = getClient();
} else {
  if (!(global as Global).configCat) {
    (global as Global).configCat = getClient();
  }
  configCat = (global as Global).configCat;
}

export default configCat;
