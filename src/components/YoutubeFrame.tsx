import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  youtubeId: string;
}

/**
 * @see https://buhalbu.com/nextjs/articles/next-js-adventures-embedded-youtube-videos
 * @see https://developer.chrome.com/docs/lighthouse/performance/third-party-facades/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
const YoutubeFrame: React.FC<Props> = ({ youtubeId }) => {
  const [show, setShow] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    if (wrapper?.current) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entrie of entries) {
            setShow(entrie.isIntersecting);
          }
        },
        { root: null, rootMargin: "100px", threshold: [0.01] }
      );
      observer.observe(wrapper.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={wrapper} className="relative flex h-full w-full items-center">
      {show ? (
        <iframe
          className="h-[200%] w-[200%] border-none"
          allow="autoplay; encrypted-media;"
          title="Youtube background video"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&loop=1&mute=1&playlist=${youtubeId}&controls=0&fs=0`}
          width="640"
          height="360"
        />
      ) : (
        <Image
          className="object-cover object-center"
          alt="Youtube video placeholder"
          src={`https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`}
          fill
        />
      )}
    </div>
  );
}

export default YoutubeFrame;
/*
   <iframe
            className="h-[200%] w-[200%] border-none"
            allowFullScreen
            allow="autoplay; encrypted-media;"
            title="Rare Ford F-150 Raptor Sighting at Northwest Motorsport"
            src={`https://www.youtube-nocookie.com/embed/${props.youtubeid}?autoplay=1&loop=1&mute=1&playlist=${props.youtubeid}&controls=0&fs=0`}
            width="640"
            height="360"
          ></iframe>

*/
