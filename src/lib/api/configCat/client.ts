import ConfigServiceBase, { ConfigFetcher } from "./configServiceBase";
import type LazyConfigService from "./lazyConfigService";
import { type User, RolloutEvaluate } from "./rollout";

export class ConfigCatClient<TService extends ConfigServiceBase & ConfigFetcher = LazyConfigService> {
    constructor(private service: TService) { }
    async getValue<T extends string | boolean | number>(key: string, defaultValue: T, user?: User) {
        const config = await this.service.getConfig<T>();
        return RolloutEvaluate<T>(config, key, defaultValue, user);
    }
}