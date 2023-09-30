import type { GoogleImage } from "@/lib/api/googleDrive";
import { GOOGLE_DRIVE_IMAGE_ROOT } from "@/lib/utils/googleConsts";
import Image from "next/image";
import { useState } from "react";

const ModalImage: React.FC<{ image: GoogleImage }> = ({ image }) => {
    const [selected, setSelected] = useState(false);
    return (
        <div data-headlessui-state={selected ? "active" : undefined} onClick={() => setSelected(value => !value)} className="col-span-1 transition-colors duration-75 ease-in-out bg-white flex flex-col rounded-md border border-[var(--border-color)] hover:border-[var(--darker-border-color)] ui-active:border-2 ui-active:border-[var(--alert-color)] cursor-pointer max-h-52">
            <div className="p-4 h-full">
                <div className="relative h-full rounded-md">
                    <Image
                        className="object-contain object-center rounded-md"
                        referrerPolicy="no-referrer"
                        unoptimized
                        loading="lazy"
                        fill
                        sizes={
                            image.appProperties?.sizes ??
                            `(max-width: ${image.imageMediaMetadata.width}px) 100vw, ${image.imageMediaMetadata.width}px`
                        }
                        src={`${GOOGLE_DRIVE_IMAGE_ROOT}${image.id}`}
                        alt={image?.appProperties?.alt ?? image.name ?? "Uploaded Image"} />
                </div>
            </div>
            <div className="flex h-fit items-center gap-2 p-2 border-t">
                <input type="checkbox" onChange={(ev) => setSelected(ev.target.checked)} checked={selected} />
                <span className="line-clamp-1 text-ellipsis overflow-hidden text-sm whitespace-nowrap">{image.name}</span>
            </div>
        </div>
    );
}

export default ModalImage;