"use client";
import { useEffect } from "react";

/**
 * Have to load this via dynamic import with ssr = false
 */
const Runtime: React.FC<{ enable: boolean }> = ({ enable }) => {
  useEffect(() => {
    const init = async () => {
      const { initTE, Carousel } = await import("tw-elements");
      initTE({ Carousel });
    }
    if (enable) init().catch(err => console.error(err));
  }, [enable]);
  return null;
};

export default Runtime;
