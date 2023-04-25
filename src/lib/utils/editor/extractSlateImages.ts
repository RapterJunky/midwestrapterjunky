import type { Block, NonTextNode } from "datocms-structured-text-slate-utils";

const extractSlateImages = (nodes: NonTextNode[]) => {
  const images: {
    id: string;
    width: number;
    height: number;
    file: File;
  }[] = [];

  for (const node of nodes) {
    if (node.type === "block" && node.blockModelId === "ImageRecord") {
      if (!node.id) continue;

      images.push({
        id: node.id,
        width: (node as Block & { width: number; height: number; file: File })
          .width,
        height: (node as Block & { width: number; height: number; file: File })
          .height,
        file: (node as Block & { width: number; height: number; file: File })
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
