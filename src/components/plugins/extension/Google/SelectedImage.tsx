import Image from "next/image";
import type { ResponsiveImage } from "@type/page";

const SelectedImage: React.FC<{
  drop: () => void;
  onDrop: (from: number, to: number) => void;
  idx: number;
  image: ResponsiveImage<{ width: number; height: number }>;
}> = ({ image, drop, idx, onDrop }) => {
  return (
    <div className="group flex flex-col rounded-md border border-[var(--border-color)] hover:border-[var(--darker-border-color)] hover:shadow">
      <div
        onDrop={(ev) => {
          ev.preventDefault();
          const fromIndex = parseInt(ev.dataTransfer.getData("index"));
          onDrop(fromIndex, idx);
        }}
        onDragOver={(ev) => ev.preventDefault()}
        onDragStart={(ev) => ev.dataTransfer.setData("index", idx.toString())}
        draggable
        style={{ backgroundColor: "var(--lighter-bg-color)" }}
        className="relative flex h-32 w-56 cursor-move items-center justify-center"
      >
        <div className="absolute hidden flex-col items-center justify-center rounded-md bg-white py-2 shadow-lg group-hover:flex">
          <button
            className="w-full px-4 py-0.5 text-[var(--font-size-xs)] hover:bg-[var(--light-bg-color)] hover:text-[var(--alert-color)]"
            onClick={drop}
          >
            Remove
          </button>
        </div>
        <Image
          referrerPolicy="no-referrer"
          unoptimized
          height={100}
          width={100}
          sizes={image.responsiveImage.sizes}
          placeholder={image.blurUpThumb.length ? "blur" : "empty"}
          src={image.responsiveImage.src}
          alt={image.responsiveImage.alt ?? "GDrive Image"}
          blurDataURL={image.blurUpThumb}
        />
      </div>
      <div className="flex justify-center border-t border-[var(--border-color)] py-2">
        <span className="text-xs text-[var(--light-body-color)]">
          No metadata set
        </span>
      </div>
    </div>
  );
};
export default SelectedImage;
