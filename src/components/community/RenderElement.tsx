import { HiLink } from 'react-icons/hi';
import Image from 'next/image';
import type { RenderElementProps } from 'slate-react';

const RenderElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
    switch (element.type) {
        case "blockquoteSource":
        case "blockquote":
            return (
                <blockquote {...attributes}>
                    {children}
                </blockquote>
            );
        case "heading": {
            switch (element.level) {
                case 1:
                    return (
                        <h1 {...attributes}>{children}</h1>
                    );
                case 2:
                    return (
                        <h2 {...attributes}>{children}</h2>
                    );
                case 3:
                    return (
                        <h3 {...attributes}>{children}</h3>
                    );
                case 4:
                    return (
                        <h4 {...attributes}>{children}</h4>
                    );
                case 5:
                    return (
                        <h5 {...attributes}>{children}</h5>
                    );
                default:
                    return (
                        <h6 {...attributes}>{children}</h6>
                    );
            }
        }
        case "list": {
            if (element.style === "bulleted") {
                return (
                    <ul {...attributes}>
                        {children}
                    </ul>
                );
            }
            return (
                <ol {...attributes}>
                    {children}
                </ol>
            );
        }
        case "thematicBreak":
            return (<hr {...attributes} />);
        case "listItem":
            return (<li {...attributes}>{children}</li>);
        case "paragraph":
            return (
                <p {...attributes}>
                    {children}
                </p>
            )
        case "block": {
            if (element.blockModelId === "image") {
                console.log(element?.url)
                return (
                    <div className="relative flex justify-center" id={element.id} {...attributes}>
                        <Image className="rounded-sm object-center shadow" src={element?.url as string ?? ""} alt="alt" width={element.width as number} height={element.height as number} />
                    </div>
                );
            }
            return children;
        }
        case "link":
            return (
                <a href={element.url} className="flex items-center gap-1">
                    <HiLink />
                    {children}
                </a>
            );
        case "inlineItem":
        case "itemLink":
        default:
            return children;
    }
}

export default RenderElement; 