import type {
  SeoOrFaviconTag,
  RegularMetaAttributes,
  SeoMetaTag,
} from "react-datocms";

export const getDescriptionTag = (tags: SeoOrFaviconTag[]): string => {
  const value = tags.find(
    (value) =>
      value.tag === "meta" &&
      (value.attributes as RegularMetaAttributes)?.name === "description"
  );
  if (!value) return "";
  return (value as SeoMetaTag).attributes.content;
};
