import {
  $applyNodeReplacement,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  DecoratorNode,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  CLICK_COMMAND,
  $getRoot,
  $isParagraphNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import Image from "next/image";

import type { ExtendLexicalEditor } from "../plugins/ImagesPlugin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ImagePayload = {
  alt: string;
  src: string;
  height: number;
  width: number;
  file?: File;
  blurDataURL?: string;
  imageType?: "google" | "external";
  id?: string;
  key?: NodeKey;
};

export type SerializedImageNode = Spread<
  {
    alt: string;
    src: string;
    width: number;
    id?: string;
    blurDataURL?: string;
    imageType: "google" | "external";
    height: number;
  },
  SerializedLexicalNode
>;

const ImageComment: React.FC<{
  __blurDataURL: string;
  __src: string;
  __alt: string;
  __id: string | undefined;
  __width: number;
  __key: NodeKey;
  __height: number;
  hasImageRef: boolean;
}> = ({
  __alt,
  __blurDataURL,
  __height,
  __src,
  __width,
  __key,
  __id,
  hasImageRef,
}) => {
    const [isSelected, setSelected, clearSelection] =
      useLexicalNodeSelection(__key);
    const imageRef = useRef(null);
    const [editor] = useLexicalComposerContext();

    const onDelete = useCallback(
      (ev: KeyboardEvent) => {
        if (isSelected && $isNodeSelection($getSelection())) {
          ev.preventDefault();
          const node = $getNodeByKey(__key);
          if ($isImageNode(node)) {
            if (hasImageRef && __id && !node.isPlaceholder())
              (editor as ExtendLexicalEditor).addDeletedImage(__id);
            node.remove();
          }
        }
        return false;
      },
      [isSelected, __key, editor, __id, hasImageRef],
    );

    useEffect(() => {
      return mergeRegister(
        editor.registerCommand<MouseEvent>(
          CLICK_COMMAND,
          (ev) => {
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
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_DELETE_COMMAND,
          onDelete,
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          onDelete,
          COMMAND_PRIORITY_LOW,
        ),
      );
    }, [editor, onDelete, clearSelection, isSelected, setSelected]);

    return (
      <div>
        {isSelected ? (
          <Button
            type="button"
            onClick={() =>
              editor.dispatchCommand(KEY_DELETE_COMMAND, new KeyboardEvent(""))
            }
            className="absolute left-2 top-2"
            variant="destructive"
            size="icon"
          >
            <Trash2 />
          </Button>
        ) : null}
        <Image
          ref={imageRef}
          blurDataURL={__blurDataURL}
          placeholder="blur"
          unoptimized
          referrerPolicy="no-referrer"
          className={cn("block max-w-full rounded-sm", {
            "border-2 border-blue-500": isSelected,
          })}
          src={__src}
          alt={__alt}
          width={__width}
          height={__height}
        />
      </div>
    );
  };

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  private __src: string;
  private __alt: string;
  private __width: number;
  private __height: number;
  private __imageType: "google" | "external" = "google";
  private __id?: string;
  private __blurDataURL: string;
  private __file?: File;
  static getType(): string {
    return "image";
  }
  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__blurDataURL,
      node.__id,
      node.__imageType,
      node.__file,
      node.__key,
    );
  }
  static importJSON({
    src,
    alt,
    width,
    height,
    id,
    blurDataURL,
    imageType,
  }: SerializedImageNode): ImageNode {
    return $createImageNode({
      src,
      alt,
      width,
      height,
      id,
      blurDataURL,
      imageType,
    });
  }
  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        priority: 0,
        conversion: convertImageElement,
      }),
    };
  }

  constructor(
    src: string,
    alt: string,
    width: number,
    height: number,
    blurDataURL?: string,
    id?: string,
    imageType?: "google" | "external",
    file?: File,
    key?: NodeKey,
  ) {
    super(key);

    this.__file = file;
    this.__src = src;
    this.__alt = alt;
    this.__height = height;
    this.__width = width;
    this.__blurDataURL =
      blurDataURL ??
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    this.__id = imageType === "google" && !id ? `{${crypto.randomUUID()}}` : id;
    this.__imageType = imageType ?? "external";
  }

  public exportDOM(): DOMExportOutput {
    const element = document.createElement("img");

    if (
      this.__id &&
      this.__id.startsWith("{") &&
      this.__id.endsWith("}") &&
      this.imageType === "google"
    ) {
      element.setAttribute("src", this.__id);
      element.setAttribute("data-blur-url", this.__id);
    } else {
      element.setAttribute("src", this.__src);
      if (!this.__blurDataURL.startsWith("data:image/gif;"))
        element.setAttribute("data-blur-url", this.__blurDataURL);
    }

    element.setAttribute("alt", this.__alt);
    element.setAttribute("width", this.__width.toString());
    element.setAttribute("height", this.__height.toString());
    if (this.__id) element.setAttribute("id", this.__id);
    element.setAttribute("data-image-type", this.__imageType);

    return {
      element,
    };
  }

  public exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      blurDataURL: this.__blurDataURL,
      id: this.__id,
      imageType: this.__imageType,
      width: this.__width,
      height: this.__height,
      src: this.__src,
      alt: this.__alt,
    };
  }

  public createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const span = document.createElement("span");

    span.className = "m-4 cursor-default inline-block relative z-1 not-prose";

    return span;
  }

  public updateDOM(): boolean {
    return false;
  }

  public isPlaceholder() {
    return this.__id && this.__id.startsWith("{") && this.__id.endsWith("}");
  }

  public get file(): File | undefined {
    return this.__file;
  }
  public get hasFile(): boolean {
    return !!this.__file;
  }

  public get imageType(): "google" | "external" {
    return this.__imageType;
  }

  public get src(): string {
    return this.__src;
  }

  public get alt(): string {
    return this.__alt;
  }

  public get id(): string | undefined {
    return this.__id;
  }

  public decorate(): React.JSX.Element {
    const hasImageRef =
      !!this.__id?.startsWith("{") &&
      !!this.__id?.endsWith("}") &&
      this.__imageType === "google";

    return (
      <ImageComment
        __key={this.getKey()}
        __id={this.__id}
        __blurDataURL={this.__blurDataURL}
        __src={this.__src}
        __alt={this.__alt}
        hasImageRef={hasImageRef}
        __width={this.__width}
        __height={this.__height}
      />
    );
  }
}

export function $createImageNode({
  src,
  alt,
  width,
  height,
  key,
  imageType,
  file,
  blurDataURL,
  id,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(
      src,
      alt,
      width,
      height,
      blurDataURL,
      id,
      imageType,
      file,
      key,
    ),
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}

function walk(nodes: LexicalNode[]) {
  const imageNodes: ImageNode[] = [];

  for (const node of nodes) {
    if ($isParagraphNode(node)) {
      const images = walk(node.getChildren());
      imageNodes.push(...images);
      continue;
    }
    if ($isImageNode(node)) {
      if (!node.hasFile) continue;
      imageNodes.push(node);
    }
  }

  return imageNodes;
}

export function $getNewImages() {
  const root = $getRoot();
  return walk(root.getChildren());
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt, width, height, id } = domNode;

    let imageType =
      (domNode.getAttribute("data-image-type") as
        | "external"
        | "google"
        | null) ?? "external";

    if (!["google", "extneral"].includes(imageType)) {
      imageType = "external";
    }

    const blurDataURL = domNode.getAttribute("data-blur-url") ?? undefined;

    const node = $createImageNode({
      alt,
      src,
      width,
      height,
      id,
      imageType,
      blurDataURL,
    });
    return { node };
  }
  return null;
}
