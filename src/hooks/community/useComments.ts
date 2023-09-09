import { commentContext } from "@/components/providers/CommentProvider";
import { useContext } from "react";

const useComments = () => {
  const ctx = useContext(commentContext);
  if (!ctx) throw new Error("useComments is not wrapped in a provider");

  return ctx;
};

export default useComments;
