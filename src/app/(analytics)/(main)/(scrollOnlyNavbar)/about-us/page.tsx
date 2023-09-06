import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import { toNextMetadata, type SeoOrFaviconTag } from "react-datocms/seo";
import type { Metadata } from "next";
import Image from "next/image";

import {
  markRules,
  renderBlock,
  renderInlineRecord,
} from "@/lib/structuredTextRules";
import type { ModulerContent, ResponsiveImage } from "@/types/page";
import type { GenericPageResult } from "@/gql/queries/generic";
import ModuleContent from "@/components/layout/ModuleContent";
import getPageQuery from "@/lib/services/GetPageQuery";
import AboutUsQuery from "@/gql/queries/about_us";

interface AboutUsProps extends GenericPageResult {
  aboutUsModel: {
    seo: SeoOrFaviconTag[];
    imageTitle: string;
    title: string;
    content: StructuredTextGraphQlResponse<
      {
        content: ResponsiveImage<{ width: number; height: number }>;
        __typename: string;
        id: string;
      },
      {
        title: string;
        slug: string;
        __typename: string;
        id: string;
      }
    >;
    footerContent: ModulerContent[];
    image: ResponsiveImage | null;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageQuery<AboutUsProps>(AboutUsQuery);
  return toNextMetadata([
    ...data.site.faviconMetaTags,
    ...data.aboutUsModel.seo,
  ]);
}

const AboutUs: React.FC = async () => {
  const { aboutUsModel } = await getPageQuery<AboutUsProps>(AboutUsQuery);
  return (
    <>
      <div className="mb-9 mt-40 flex flex-col gap-4 md:mx-40 md:flex-row">
        <article className="flex flex-col gap-3 p-3 md:w-2/3">
          <div className="mb-4 flex justify-center">
            <h1 className="text-2xl font-bold">{aboutUsModel.title}</h1>
          </div>
          <StructuredText
            renderBlock={renderBlock}
            renderInlineRecord={renderInlineRecord}
            customMarkRules={markRules}
            data={aboutUsModel.content}
          />
        </article>
        <aside className="flex flex-col px-3 md:w-1/3">
          <div className="relative h-80 w-full">
            {aboutUsModel.image ? (
              <Image
                className="object-contain object-top"
                src={aboutUsModel.image.responsiveImage.src}
                alt={aboutUsModel.image.responsiveImage.alt ?? "Article Image"}
                fill
                placeholder={aboutUsModel.image.blurUpThumb ? "blur" : "empty"}
                sizes={aboutUsModel.image.responsiveImage.sizes}
                blurDataURL={aboutUsModel.image.blurUpThumb}
              />
            ) : null}
          </div>
          <div className="flex justify-center">
            <h5 className="font-bold">{aboutUsModel.imageTitle}</h5>
          </div>
        </aside>
      </div>
      <ModuleContent modules={aboutUsModel.footerContent} />
    </>
  );
};

export default AboutUs;
