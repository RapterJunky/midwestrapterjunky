import { Carousel, initTE } from "tw-elements";
import { useEffect } from "react";

/**
 * Have to load this via dynamic import with ssr = false
 */
const Runtime: React.FC<{ enable: boolean }> = ({ enable }) => {
  useEffect(() => {
    if (enable) initTE({ Carousel });
  }, [enable]);
  return null;
};

export default Runtime;
