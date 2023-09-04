import { type LexicalCommand, createCommand, $insertNodes, $isRootOrShadowRoot, $createParagraphNode, COMMAND_PRIORITY_EDITOR } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { useEffect } from "react";
import { $createImageNode, ImageNode, type ImagePayload } from "../nodes/ImageNode";

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand("INSERT_IMAGE_COMMAND");

const ImagesPlugin: React.FC = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error("ImagesPlugin: ImageNode not registerd on editor");
        }

        return mergeRegister(
            editor.registerCommand<InsertImagePayload>(INSERT_IMAGE_COMMAND, (payload) => {
                const imageNode = $createImageNode(payload);
                $insertNodes([imageNode]);
                if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                    $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
                }
                return true;
            }, COMMAND_PRIORITY_EDITOR)
        );
    }, [editor]);


    return null;
}

export default ImagesPlugin;