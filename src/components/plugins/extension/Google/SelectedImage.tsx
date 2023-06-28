import Image from "next/image";

import type { ResponsiveImage } from "@type/page";

const SelectedImage: React.FC<{
    drop: () => void;
    onDrop: (from: number, to: number) => void;
    idx: number;
    image: ResponsiveImage<{ width: number; height: number }>;
}> = ({ image, drop, idx, onDrop }) => {
    return (
        <div
            onDrop={(ev) => {
                ev.preventDefault();
                const fromIndex = parseInt(ev.dataTransfer.getData("index"));
                onDrop(fromIndex, idx);
            }}
            onDragOver={(ev) => ev.preventDefault()}
            onDragStart={(ev) => ev.dataTransfer.setData("index", idx.toString())}
            draggable
            className="group relative flex h-32 w-56 cursor-move items-center justify-center rounded-md border border-dato-border bg-dato-lighter shadow hover:border-dato-darker"
        >
            <div className="absolute hidden items-center justify-center rounded-sm bg-white py-2 shadow group-hover:flex">
                <button
                    className="w-full px-4 py-0.5 text-lg hover:bg-dato-light hover:text-dato-alert"
                    onClick={drop}
                >
                    Remove
                </button>
            </div>
            <Image
                height={100}
                width={100}
                sizes={image.responsiveImage.sizes}
                placeholder={image.blurUpThumb.length ? "blur" : "empty"}
                src={image.responsiveImage.src}
                alt={image.responsiveImage.alt ?? "GDrive Image"}
                blurDataURL={image.blurUpThumb}
            />
        </div>
    );
};
export default SelectedImage;