import { useEffect, useRef } from "react";

const useOnce = (run: () => void) => {
  const loaded = useRef<boolean>(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    run();
  }, [run]);
};

export default useOnce;
