import type { Block, NonTextNode } from "datocms-structured-text-slate-utils";

type UploadedImageBlock = Block & { src: string; width: number; height: number; file: File };

const extractSlateImages = (nodes: NonTextNode[]) => {
  const images: {
    id: string;
    width: number;
    height: number;
    file: File;
  }[] = [];

  for (const node of nodes) {
    if (node.type === "block" && node.blockModelId === "ImageRecord") {
      // if no id or if src is not as data image
      if (!node.id || !(node as UploadedImageBlock).src.startsWith("data:image/")) continue;

      images.push({
        id: node.id,
        width: (node as UploadedImageBlock)
          .width,
        height: (node as UploadedImageBlock)
          .height,
        file: (node as UploadedImageBlock)
          .file,
      });

      delete node.width;
      delete node.height;
      delete node.file;
      delete node.src;

      continue;
    }

    if (node.children) {
      const data = extractSlateImages(node.children as NonTextNode[]);
      images.push(...data);
    }
  }

  return images;
};

export default extractSlateImages;
