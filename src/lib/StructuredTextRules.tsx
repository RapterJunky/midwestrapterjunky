import { isParagraph, isHeading } from "datocms-structured-text-utils";
import {
  renderNodeRule,
  renderMarkRule,
  type RenderBlockContext,
  type RenderInlineRecordContext,
} from "react-datocms/structured-text";
import Image from "next/image";
import Link from "next/link";

//https://github.com/datocms/react-datocms/blob/master/docs/structured-text.md
export const markRules = [
  renderMarkRule(
    (a) => a.startsWith("text-"),
    (props) => {
      return props.adapter.renderNode("span", {
        key: props.key,
        className: props.mark,
        children: props.children,
      });
    }
  ),
];

export const renderInlineRecord = ({
  record,
}: RenderInlineRecordContext<any>) => {
  switch (record.__typename) {
    case "EventRecord":
      return (
        <Link title={`Event: ${record.title}`} className="underline" href={`/events/${record.slug}`}>
          {record.title}
        </Link>
      );
    case "ArticleRecord":
      return (
        <Link title={`Article: ${record.title}`} className="underline" href={`/blog/${record.slug}`}>
          {record.title}
        </Link>
      );
    default:
      return null;
  }
};

export const renderBlock = ({ record }: RenderBlockContext<any>) => {
  switch (record.__typename) {
    case "ImageRecord":
      return (
        <div className="relative">
          <Image
            className="object-center shadow rounded"
            width={record.content.responsiveImage.width}
            height={record.content.responsiveImage.height}
            blurDataURL={record.content.blurUpThumb}
            src={record.content.responsiveImage.src}
            alt={record.content.responsiveImage.alt}
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
      );
    }
  ),
  renderNodeRule(isParagraph, (props) => {
    return props.adapter.renderNode(
      "p",
      { key: props.key, className: props.node?.style },
      props.children
    );
  }),
];
