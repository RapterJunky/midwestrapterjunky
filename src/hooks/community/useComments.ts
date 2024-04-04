import { useContext } from "react";
import { commentContext } from "@/components/providers/CommentProvider";

const useComments = () => {
  const ctx = useContext(commentContext);
  if (!ctx) throw new Error("useComments is not wrapped in a provider");

  return ctx;
};

export default useComments;
