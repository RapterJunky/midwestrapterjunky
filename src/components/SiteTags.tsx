import {
  type SeoOrFaviconTag,
  type RegularMetaAttributes,
  type OgMetaAttributes,
} from "react-datocms";
import { renderMetaTags } from 'react-datocms/seo';
import Head from "next/head";
export default function SiteTags({
  tags,
  ignore = [],
}: {
  ignore?: string[];
  tags: SeoOrFaviconTag[][];
}) {
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
}
