import type { ProjectConfig } from "./types";

export type Cache = {
  set(key: string, config: ProjectConfig<string | boolean | number>): void;
  get(key: string): Promise<ProjectConfig<string | boolean | number> | null>;
};

export class InMemoryCache implements Cache {
  private cache = new Map<string, ProjectConfig<string | boolean | number>>();
  set(key: string, config: ProjectConfig<string | boolean | number>): void {
    this.cache.set(key, config);
  }
  get(key: string): Promise<ProjectConfig<string | boolean | number> | null> {
    return new Promise((ok) => ok(this.cache.get(key) ?? null));
  }
}
