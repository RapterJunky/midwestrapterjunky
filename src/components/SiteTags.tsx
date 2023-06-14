import type {
  SeoOrFaviconTag,
  RegularMetaAttributes,
  OgMetaAttributes,
} from "react-datocms";
import { renderMetaTags } from "react-datocms/seo";
import Head from "next/head";
const SiteTags: React.FC<{
  ignore?: string[];
  tags: SeoOrFaviconTag[][];
}> = ({ tags, ignore = [] }) => {
  return (
    <Head>
      {renderMetaTags(
        tags
          .flat(2)
          .filter(
            (value) =>
              !ignore.includes(
                (value?.attributes as RegularMetaAttributes)?.name ??
                  (value?.attributes as OgMetaAttributes)?.property ??
                  ""
              )
          )
      )}
    </Head>
  );
};

export default SiteTags;
