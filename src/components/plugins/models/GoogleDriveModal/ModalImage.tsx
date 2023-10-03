import { useEffect, useState } from "react";
import Image from "next/image";

import { GOOGLE_DRIVE_IMAGE_ROOT } from "@/lib/utils/googleConsts";
import type { GoogleImage } from "@/lib/api/googleDrive";

const ModalImage: React.FC<{
  image: GoogleImage;
  onSelected: (state: boolean, id: string) => void;
}> = ({ image, onSelected }) => {
  const [selected, setSelected] = useState(false);

  const imageId = image.id;

  useEffect(() => {
    onSelected(selected, imageId);
  }, [selected, imageId, onSelected]);

  return (
    <div
      data-headlessui-state={selected ? "active" : undefined}
      onClick={() => setSelected((value) => !value)}
      className="col-span-1 flex max-h-52 cursor-pointer flex-col rounded-md border border-[var(--border-color)] bg-white transition-colors duration-75 ease-in-out hover:border-[var(--darker-border-color)] ui-active:border-2 ui-active:border-[var(--alert-color)]"
    >
      <div className="h-full p-4">
        <div className="relative h-full rounded-md">
          <Image
            blurDataURL={image.appProperties?.blurthumb}
            placeholder={
              image.appProperties?.blurthumb?.length ? "blur" : "empty"
            }
            className="rounded-md object-contain object-center"
            referrerPolicy="no-referrer"
            unoptimized
            loading="lazy"
            fill
            sizes={
              image.appProperties?.sizes ??
              `(max-width: ${image.imageMediaMetadata.width}px) 100vw, ${image.imageMediaMetadata.width}px`
            }
            src={`${GOOGLE_DRIVE_IMAGE_ROOT}${image.id}`}
            alt={image?.appProperties?.alt ?? image.name ?? "Uploaded Image"}
          />
        </div>
      </div>
      <div className="flex h-fit items-center gap-2 border-t p-2">
        <input
          type="checkbox"
          onChange={(ev) => setSelected(ev.target.checked)}
          checked={selected}
        />
        <span className="line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
          {image.name}
        </span>
      </div>
    </div>
  );
};

export default ModalImage;
