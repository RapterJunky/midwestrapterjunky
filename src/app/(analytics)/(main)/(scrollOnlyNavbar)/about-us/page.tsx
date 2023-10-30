import { StructuredText } from "react-datocms/structured-text";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";

import {
  markRules,
  renderBlock,
  renderInlineRecord,
} from "@/lib/structuredTextRules";
import AboutUsQuery, { type AboutUsQueryResult } from "@/gql/queries/about_us";
import ModuleContent from "@/components/layout/ModuleContent";
import getPageQuery from "@/lib/services/GetPageQuery";

import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { aboutUsModel } = await getPageQuery<AboutUsQueryResult>(AboutUsQuery);

  return getSeoTags({
    datocms: aboutUsModel.seo,
    slug: "/about-us",
    parent,
  });
}

const AboutUs: React.FC = async () => {
  const { aboutUsModel } = await getPageQuery<AboutUsQueryResult>(AboutUsQuery);
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
