import type { ConfigFetcher } from "./configServiceBase";
import type ConfigServiceBase from "./configServiceBase";
import type LazyConfigService from "./lazyConfigService";
import { RolloutEvaluate, type User } from "./rollout";

export class ConfigCatClient<
  TService extends ConfigServiceBase & ConfigFetcher = LazyConfigService,
> {
  constructor(private service: TService) {}
  async getValue<T extends string | boolean | number>(
    key: string,
    defaultValue: T,
    user?: User,
  ) {
    const config = await this.service.getConfig<T>();
    return RolloutEvaluate<T>(config, key, defaultValue, user);
  }
}
