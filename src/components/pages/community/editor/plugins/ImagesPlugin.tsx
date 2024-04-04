import {
  $createImageNode,
  ImageNode,
  type ImagePayload,
} from "../nodes/ImageNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
  type LexicalEditor,
} from "lexical";
import { useEffect } from "react";

export type InsertImagePayload = Readonly<ImagePayload>;

export type ExtendLexicalEditor = LexicalEditor & {
  getDeletedImages: () => Set<string>;
  _deletedImages: Set<string>;
  addDeletedImage: (id: string) => void;
};

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

const ImagesPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registerd on editor");
    }

    (editor as ExtendLexicalEditor)._deletedImages = new Set<string>();

    (editor as ExtendLexicalEditor).addDeletedImage = (id: string) =>
      (editor as ExtendLexicalEditor)._deletedImages.add(id);
    (editor as ExtendLexicalEditor).getDeletedImages = () =>
      (editor as ExtendLexicalEditor)._deletedImages;

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
};

export default ImagesPlugin;
