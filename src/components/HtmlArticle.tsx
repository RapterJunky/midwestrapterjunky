import HTMLReactParser from 'html-react-parser';
import Image from 'next/image';

const HtmlArticle: React.FC<{ content: string }> = ({ content }) => {

    const el = HTMLReactParser(content, {
        replace(domNode) {
            if (domNode instanceof HTMLImageElement) {
                const { width, id, height, src, alt } = domNode;

                const blur = domNode.getAttribute("data-blur-url") ?? undefined;

                return (
                    <Image src={src} id={id} width={width} height={height} alt={alt} placeholder={blur ? "blur" : "empty"} blurDataURL={blur} />
                );

            }
        },
    })

    return el;
}

export default HtmlArticle;