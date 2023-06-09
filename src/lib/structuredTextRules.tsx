import {
  isParagraph,
  isHeading,
  type RenderRule,
  type TrasformFn,
} from "datocms-structured-text-utils";
import {
  renderNodeRule,
  renderMarkRule,
  type RenderBlockContext,
  type RenderInlineRecordContext,
} from "react-datocms/structured-text";
import { HiLink } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import type { ResponsiveImage } from "@type/page";


//https://github.com/datocms/react-datocms/blob/master/docs/structured-text.md
export const markRules = [
  renderMarkRule(
    (a) => a.startsWith("text-"),
    (props) => {
      return props.adapter.renderNode("span", {
        key: props.key,
        className: props.mark,
        children: props.children,
      }) as RenderRule<TrasformFn, TrasformFn, TrasformFn>;
    }
  ),
];

export const renderInlineRecord = ({
  record,
}: RenderInlineRecordContext<{
  __typename: string;
  id: string;
  title: string;
  slug: string;
}>) => {
  switch (record.__typename) {
    case "EventRecord":
      return (
        <Link
          title={`Event: ${record.title}`}
          className="underline"
          href={`/events/${record.slug}`}
        >
          {record.title}
        </Link>
      );
    case "ArticleRecord":
      return (
        <Link
          title={`Article: ${record.title}`}
          className="underline"
          href={`/blog/${record.slug}`}
        >
          {record.title}
        </Link>
      );
    case "ExternalLink":
      return (
        <span className="flex items-center gap-1">
          <HiLink />
          <Link className="underline" href={record.slug}>
            {record.title}
          </Link>
        </span>
      );
    default:
      return null;
  }
};

export const renderBlock = ({
  record,
}: RenderBlockContext<{
  __typename: string;
  id: string;
  content: ResponsiveImage<{ width: number; height: number }>;
}>) => {
  switch (record.__typename) {
    case "ImageRecord":
      return (
        <div className="relative flex justify-center">
          <Image
            placeholder={record.content.blurUpThumb.length ? "blur" : "empty"}
            className="rounded-sm object-center shadow"
            width={record.content.responsiveImage.width}
            height={record.content.responsiveImage.height}
            blurDataURL={record.content.blurUpThumb}
            src={record.content.responsiveImage.src}
            alt={record.content.responsiveImage?.alt ?? "Article Content"}
          />
        </div>
      );
    default:
      return null;
  }
};

export const rules = [
  renderNodeRule(
    isHeading,
    ({ adapter: { renderNode }, node, children, key }) => {
      return renderNode(
        `h${node.level}`,
        { key, className: node.style },
        children
      ) as RenderRule<TrasformFn, TrasformFn, TrasformFn>;
    }
  ),
  renderNodeRule(isParagraph, (props) => {
    return props.adapter.renderNode(
      "p",
      { key: props.key, className: props.node?.style },
      props.children
    ) as RenderRule<TrasformFn, TrasformFn, TrasformFn>;
  }),
];
