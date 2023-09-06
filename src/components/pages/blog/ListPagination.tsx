"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const ListPagination: React.FC<{
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageCount: number;
}> = ({ pageCount, hasPrevPage, hasNextPage }) => {
  const params = useSearchParams();
  const router = useRouter();

  const page = Number(params?.get("page") ?? "1");

  return (
    <>
      <Button
        onClick={() => router.push(`/blog/list?page=${page - 1}`)}
        aria-label="Previous Page"
        disabled={!hasPrevPage}
      >
        Prev
      </Button>
      <span>
        {page} of {pageCount}
      </span>
      <Button
        onClick={() => router.push(`/blog/list?page=${page + 1}`)}
        disabled={!hasNextPage}
        aria-label="Next Page"
      >
        Next
      </Button>
    </>
  );
};

export default ListPagination;
