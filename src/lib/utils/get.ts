type GetIndexedField<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
    ? "length" extends keyof T
      ? number extends T["length"]
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
    ?
        | FieldWithPossiblyUndefined<Exclude<T, undefined>[Left], Right>
        | Extract<T, undefined>
    : Left extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? FieldWithPossiblyUndefined<
            IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>,
            Right
          >
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
 * Light weight version of lodash.get function
 * use in place of the lodash version
 * when working with front end pages.
 * Can be ignored when working with backend tools.
 *
 * @see https://github.com/developit/dlv
 * @see https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf
 * @see lodash.get
 */
const get = <
  TObject extends object,
  TPath extends string = string,
  TDefault = undefined,
>(
  obj: TObject,
  key: TPath | Array<string>,
  defaultValue?: TDefault,
):
  | Exclude<GetFieldType<TObject, TPath>, null | undefined>
  | TDefault
  | undefined => {
  if (!Array.isArray(key)) key = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  const item = key.reduce((obj: unknown | Record<string, unknown>, p) => {
    return typeof obj === "object" && obj
      ? (obj as Record<string, unknown>)[p]
      : defaultValue;
  }, obj);
  return (
    (item as
      | Exclude<GetFieldType<TObject, TPath>, null | undefined>
      | TDefault
      | undefined) ?? defaultValue
  );
};

export default get;
