import Link from "next/link";
import type { Color, Icon } from "@type/page";
import FontAwesomeIcon from "@components/FontAwesomeIcon";

interface SocialLinksProps {
  sociallinks: { iconColor: Color | null; logo: Icon; link: string }[];
}

export default function SocialLinks(props: SocialLinksProps) {
  return (
    <div className="top-0 z-10 flex h-full w-full flex-col">
      <div className="social flex w-full flex-col items-center justify-center bg-zinc-700 py-8">
        <div className="text-2xl font-bold text-white">Find us on</div>
        <div className="flex flex-wrap justify-center gap-5 py-4 text-9xl text-[10rem] text-white">
          {props.sociallinks.map((value, i) => (
            <Link title={value.logo.iconName} href={value.link} key={i}>
              <FontAwesomeIcon
                {...value.logo}
                style={{ color: value.iconColor?.hex ?? "white" }}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
