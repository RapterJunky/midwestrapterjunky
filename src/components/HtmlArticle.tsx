import HTMLReactParser, { Element } from 'html-react-parser';
import Image from 'next/image';

const HtmlArticle: React.FC<{ content: string }> = ({ content }) => {

    const el = HTMLReactParser(content, {
        replace(domNode) {
            if (domNode instanceof Element && domNode.name === "img") {

                return (
                    <Image
                        src={domNode.attribs.src as string}
                        id={domNode.attribs?.id}
                        width={domNode.attribs.width as `${number}`}
                        height={domNode.attribs.height as `${number}`}
                        alt={domNode.attribs.alt as string}
                        unoptimized
                        data-image-type={domNode.attribs["data-image-type"]}
                        placeholder={domNode.attribs["data-blur-url"] ? "blur" : "empty"} blurDataURL={domNode.attribs["data-blur-url"]} />
                );
            }
        },
    })

    return el;
}

export default HtmlArticle;