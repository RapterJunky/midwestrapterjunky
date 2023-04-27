import { Carousel, initTE } from "tw-elements";
import { useEffect } from "react";

/**
 * Have to load this via dynamic import with ssr = false
 */
const Runtime = () => {
  useEffect(() => {
    initTE({ Carousel });
  }, []);
  return null;
};

export default Runtime;
