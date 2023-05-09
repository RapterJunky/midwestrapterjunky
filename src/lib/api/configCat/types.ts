type ProjectItemValue<TValue extends boolean | string | number = boolean> = {
    /** value */
    v: TValue;
    /** variationId */
    i: TValue;
    /** setting type */
    t: number;
    /**rollout percentage items */
    p: unknown[];
    /** rollout rules */
    r: unknown[];
};

export type ProjectConfigJSON<TValue extends boolean | string | number = boolean> = Record<string, ProjectItemValue<TValue>>;

export type ProjectConfig<TValue extends boolean | string | number = boolean> = {
    /** Entity identifier */
    httpETag: string;
    /** ConfigCat config */
    configJSON: ProjectConfigJSON<TValue>;
    /** Timestamp in milliseconds */
    timestamp: number;
};
