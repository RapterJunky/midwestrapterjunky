"use client";
import { Parallax as ParallaxProvider, Background } from "react-parallax";
import Image from "next/image";
import type { ResponsiveImage } from "@/types/page";

const Parallax: React.FC<{ background: ResponsiveImage }> = ({ background }) => {
    return (
        <ParallaxProvider className="h-screen">
            <Background className="relative h-screen w-screen">
                <Image
                    referrerPolicy="no-referrer"
                    placeholder={background?.blurUpThumb ? "blur" : "empty"}
                    blurDataURL={background.blurUpThumb}
                    sizes={background.responsiveImage.sizes}
                    src={background.responsiveImage.src}
                    alt={background.responsiveImage?.alt ?? "parallax background"}
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                    fill
                />
            </Background>
        </ParallaxProvider>
    );
}

export default Parallax;