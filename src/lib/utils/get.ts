type GetIndexedField<T, K> = K extends keyof T
    ? T[K]
    : K extends `${number}`
    ? 'length' extends keyof T
    ? number extends T['length']
    ? number extends keyof T
    ? T[number]
    : undefined
    : undefined
    : undefined
    : undefined;

type FieldWithPossiblyUndefined<T, Key> =
    | GetFieldType<Exclude<T, undefined>, Key>
    | Extract<T, undefined>;

type IndexedFieldWithPossiblyUndefined<T, Key> =
    | GetIndexedField<Exclude<T, undefined>, Key>
    | Extract<T, undefined>;

type GetFieldType<T, P> = P extends `${infer Left}.${infer Right}`
    ? Left extends keyof Exclude<T, undefined>
    ? FieldWithPossiblyUndefined<Exclude<T, undefined>[Left], Right> | Extract<T, undefined>
    : Left extends `${infer FieldKey}[${infer IndexKey}]`
    ? FieldKey extends keyof T
    ? FieldWithPossiblyUndefined<IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>, Right>
    : undefined
    : undefined
    : P extends keyof T
    ? T[P]
    : P extends `${infer FieldKey}[${infer IndexKey}]`
    ? FieldKey extends keyof T
    ? IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>
    : undefined
    : IndexedFieldWithPossiblyUndefined<T, P>;

/**
 * @see https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf
 * @see lodash.get
 */
const get = <TObject, TPath extends string, TDefault = GetFieldType<TObject, TPath>>(obj: TObject, path: TPath, defaultValue?: TDefault): Exclude<GetFieldType<TObject, TPath>, null | undefined> | TDefault => {
    const result = path.split(".").reduce((r, p) => {
        if (typeof r === "object") {
            p = p.startsWith("[") ? p.replace(/\D/g, "") : p;
            return (r as any)[p];
        }
        return undefined;
    }, obj);
    return result ?? defaultValue as any;
}

export default get;