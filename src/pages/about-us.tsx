import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms";
import Image from "next/image";

import {
  markRules,
  renderBlock,
  renderInlineRecord,
} from "@lib/structuredTextRules";
import type {
  FullPageProps,
  ModulerContent,
  ResponsiveImage,
} from "types/page";
import ModuleContent from "@components/layout/ModuleContent";
import ExitPreview from "@components/ui/ExitPreview";
import Navbar from "@components/layout/OldNavbar";
import Footer from "@components/layout/Footer";
import about_us from "@query/queries/about_us";
import SiteTags from "@components/SiteTags";
import { DatoCMS } from "@api/gql";

interface AboutUsProps extends FullPageProps {
  aboutUsModel: {
    _seoMetaTags: SeoOrFaviconTag[];
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
    image: ResponsiveImage;
  };
}

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<AboutUsProps>> => {
  const data = await DatoCMS<AboutUsProps>(
    { query: about_us },
    {
      draft: ctx.draftMode || ctx.preview,
    }
  );

  return {
    props: {
      ...data,
      preview: (ctx?.draftMode || ctx.preview) ?? false,
    },
  };
};

const AboutUs: NextPage<AboutUsProps> = (props) => {
  return (
    <>
      <SiteTags
        tags={[
          props._site.faviconMetaTags,
          props.aboutUsModel._seoMetaTags,
          [
            {
              tag: "meta",
              attributes: {
                property: "og:url",
                content: "https://midwestraptorjunkies.com/about-us",
              },
            },
          ],
        ]}
      />
      <header>
        <Navbar {...props.navbar} mode="only-scroll" />
      </header>
      <main>
        <div className="mb-9 mt-40 flex flex-col gap-4 md:mx-40 md:flex-row">
          <article className="flex flex-col gap-3 p-3 md:w-2/3">
            <div className="mb-4 flex justify-center">
              <h1 className="text-2xl font-bold">{props.aboutUsModel.title}</h1>
            </div>
            <StructuredText
              renderBlock={renderBlock}
              renderInlineRecord={renderInlineRecord}
              customMarkRules={markRules}
              data={props.aboutUsModel.content}
            />
          </article>
          <aside className="flex flex-col px-3 md:w-1/3">
            <div className="relative h-80 w-full">
              <Image
                className="object-contain object-top"
                src={props.aboutUsModel.image.responsiveImage.src}
                alt={
                  props.aboutUsModel.image.responsiveImage.alt ??
                  "Article Image"
                }
                fill
                placeholder={
                  props.aboutUsModel.image.blurUpThumb ? "blur" : "empty"
                }
                sizes={props.aboutUsModel.image.responsiveImage.sizes}
                blurDataURL={props.aboutUsModel.image.blurUpThumb}
              />
            </div>
            <div className="flex justify-center">
              <h5 className="font-bold">{props.aboutUsModel.imageTitle}</h5>
            </div>
          </aside>
        </div>
        <ModuleContent data={props.aboutUsModel.footerContent} />
      </main>
      <Footer />
      {props.preview ? <ExitPreview /> : null}
    </>
  );
};

export default AboutUs;
