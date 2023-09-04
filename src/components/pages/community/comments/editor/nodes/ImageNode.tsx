import {
    $applyNodeReplacement,
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    DecoratorNode,
    type DOMConversionMap,
    type DOMConversionOutput,
    type DOMExportOutput,
    type EditorConfig,
    type LexicalEditor,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
    COMMAND_PRIORITY_LOW,
    KEY_DELETE_COMMAND,
    KEY_BACKSPACE_COMMAND,
    CLICK_COMMAND
} from "lexical";
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { mergeRegister } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ImagePayload = {
    alt: string;
    src: string;
    height: number;
    width: number;
    key?: NodeKey;
}

export type SerializedImageNode = Spread<{
    alt: string;
    src: string;
    width: number;
    height: number;
}, SerializedLexicalNode>;


const ImageComment: React.FC<{
    __blurDataURL: string,
    __src: string,
    __alt: string,
    __width: number,
    __key: NodeKey,
    __height: number
}> = ({ __alt, __blurDataURL, __height, __src, __width, __key }) => {
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(__key);
    const imageRef = useRef(null);
    const [editor] = useLexicalComposerContext();

    const onDelete = useCallback((ev: KeyboardEvent) => {
        if (isSelected && $isNodeSelection($getSelection())) {
            ev.preventDefault();
            const node = $getNodeByKey(__key);
            if ($isImageNode(node)) node.remove();
        }
        return false;
    }, [isSelected, __key]);

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand<MouseEvent>(CLICK_COMMAND, (ev) => {

                if (ev.target === imageRef.current) {
                    if (ev.shiftKey) {
                        setSelected(!isSelected);
                    } else {
                        clearSelection();
                        setSelected(true);
                    }
                    return true;
                }

                return false;
            }, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
        );
    }, [editor, onDelete, clearSelection, isSelected, setSelected]);

    return (
        <div>
            {isSelected ? (
                <Button type="button" onClick={() => editor.dispatchCommand(KEY_DELETE_COMMAND, new KeyboardEvent(""))} className="absolute top-2 left-2" variant="destructive" size="icon">
                    <Trash2 />
                </Button>
            ) : null}
            <Image
                ref={imageRef}
                blurDataURL={__blurDataURL}
                placeholder="blur"
                unoptimized
                referrerPolicy="no-referrer"
                className={cn("block max-w-full rounded-sm", { "border-2 border-blue-500": isSelected })}
                src={__src}
                alt={__alt}
                width={__width}
                height={__height} />
        </div>
    );
}


export class ImageNode extends DecoratorNode<React.JSX.Element> {
    private __src: string;
    private __alt: string;
    private __width: number;
    private __height: number;
    private __blurDataURL: string = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    static getType(): string {
        return "image";
    }
    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__alt, node.__width, node.__height, node.__key);
    }
    static importJSON({ src, alt, width, height }: SerializedImageNode): ImageNode {
        return $createImageNode({ src, alt, width, height });
    }
    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                priority: 0,
                conversion: convertImageElement
            })
        }
    }

    constructor(src: string, alt: string, width: number, height: number, key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__alt = alt;
        this.__height = height;
        this.__width = width
    }

    public exportDOM(): DOMExportOutput {
        const element = document.createElement("img");

        element.setAttribute("src", this.__src);
        element.setAttribute("alt", this.__alt);

        return {
            element
        }
    }

    public exportJSON(): SerializedImageNode {
        return {
            ...super.exportJSON(),
            width: this.__width,
            height: this.__height,
            src: this.__src,
            alt: this.__alt
        }
    }

    public createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
        const span = document.createElement("span");

        span.className = "m-4 cursor-default inline-block relative z-1 not-prose"

        return span;
    }

    public updateDOM(): boolean {
        return false;
    }

    public getSrc(): string {
        return this.__src;
    }

    public getAlt(): string {
        return this.__alt;
    }

    public decorate(): React.JSX.Element {
        return (
            <ImageComment
                __key={this.getKey()}
                __blurDataURL={this.__blurDataURL}
                __src={this.__src}
                __alt={this.__alt}
                __width={this.__width}
                __height={this.__height} />
        );
    }
}

export function $createImageNode({ src, alt, width, height, key }: ImagePayload): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, alt, width, height, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
    if (domNode instanceof HTMLImageElement) {
        const { src, alt, width, height } = domNode;

        const node = $createImageNode({ alt, src, width, height });
        return { node };
    }
    return null;
}