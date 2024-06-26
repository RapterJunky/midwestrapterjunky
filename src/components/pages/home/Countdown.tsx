"use client";

import Countdown, { type CountdownRendererFn } from "react-countdown";
import type { Color, ModulerContent } from "@type/page";

export interface CountDownProps extends ModulerContent {
  id: string;
  heading: string;
  bgColor: Color;
  event: {
    dateFrom: string;
    slug: string;
  };
}

const renderer: CountdownRendererFn = ({ formatted }) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
      <div className="flex w-28 flex-col items-center">
        <div className="mb-2 uppercase text-white">Days</div>
        <div className="w-full overflow-hidden rounded-sm bg-white p-2 text-center font-sans text-7xl font-light text-neutral-700 shadow">
          <div className="duration-500 animate-in slide-in-from-bottom-6">
            {formatted.days}
          </div>
        </div>
      </div>
      <div className="flex w-28 flex-col items-center">
        <div className="mb-2 uppercase text-white">Hours</div>
        <div className="w-full overflow-hidden rounded-sm bg-white p-2 text-center font-sans text-7xl font-light text-neutral-700 shadow">
          <div className="duration-500 animate-in slide-in-from-bottom-6">
            {formatted.hours}
          </div>
        </div>
      </div>
      <div className="flex w-28 flex-col items-center">
        <div className="mb-2 uppercase text-white">Minutes</div>
        <div className="w-full overflow-hidden rounded-sm bg-white p-2 text-center font-sans text-7xl font-light text-neutral-700 shadow">
          <div
            key={formatted.minutes}
            className="duration-500 animate-in slide-in-from-bottom-6"
          >
            {formatted.minutes}
          </div>
        </div>
      </div>
      <div className="flex w-28 flex-col items-center">
        <div className="mb-2 uppercase text-white">Seconds</div>
        <div className="w-full overflow-hidden rounded-sm bg-white p-2 text-center font-sans text-7xl font-light text-neutral-700 shadow">
          <div
            key={formatted.seconds}
            className="animate-in slide-in-from-bottom-6"
          >
            {formatted.seconds}
          </div>
        </div>
      </div>
    </div>
  );
};

const CountdownSection: React.FC<CountDownProps> = ({
  heading,
  event,
  bgColor,
}) => {
  return (
    <section
      className="flex flex-col items-center justify-center pb-20 pt-10 duration-150 ease-in animate-in fade-in"
      style={{ backgroundColor: bgColor.hex }}
    >
      <h2 className="font-inter my-10 text-center text-4xl font-bold leading-9 tracking-tight text-white md:leading-4">
        {heading}
      </h2>
      <Countdown renderer={renderer} date={event.dateFrom} />
    </section>
  );
};

export default CountdownSection;
