import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const RichTextEditor = dynamic(
  () => import("@components/pages/community/editor/RichTextEditor"),
  {
    loading() {
      return (
        <div className="my-4 space-y-2">
          <Skeleton className="h-[42px]" />
          <Skeleton className="h-[150px]" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      );
    },
  },
);

export default RichTextEditor;
