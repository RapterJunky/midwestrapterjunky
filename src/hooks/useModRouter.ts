import { useRouter, type NextRouter } from "next/router";
import { useRef, useState } from "react";

/**
 * @see https://stackoverflow.com/questions/69203538/useeffect-dependencies-when-using-nextjs-router
 */
const useModRouter = () => {
  const router = useRouter();
  const routerRef = useRef(router);

  routerRef.current = router;

  const [{ push }] = useState<Pick<NextRouter, "push">>({
    push: (path) => routerRef.current.push(path),
  });

  const [{ replace }] = useState<Pick<NextRouter, "replace">>({
    replace: (path) => routerRef.current.replace(path),
  });

  return {
    router,
    push,
    replace,
  };
};

export default useModRouter;
