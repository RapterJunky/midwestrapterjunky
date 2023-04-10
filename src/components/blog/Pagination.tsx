export default function Pagination({
  currentPage,
  total,
  isLoading,
  setIndex,
}: {
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  total: number;
  isLoading: boolean;
}) {
  if (isLoading) return null;

  const totalPages = Math.round(total / 5);
  const prevPage = currentPage - 1 > 0;
  const nextPage = currentPage + 1 <= totalPages;

  return (
    <div className="mt-auto space-y-2 pb-8 pt-6 md:space-y-5">
      <nav className="flex justify-between">
        <button
          data-cy="pagination-previous-page"
          aria-label="Previous Page"
          className="cursor-auto disabled:opacity-50"
          disabled={!prevPage}
          onClick={() =>
            setIndex((value) => {
              const next = value - 1;
              if (next < 0) return 0;
              return value - 1;
            })
          }
        >
          Previous
        </button>
        <span>
          {currentPage + 1} of {totalPages + 1}
        </span>
        <button
          data-cy="pagination-next-page"
          aria-label="Next Page"
          className="cursor-auto disabled:opacity-50"
          disabled={!nextPage}
          onClick={() =>
            setIndex((value) => {
              const next = value + 1;
              if (next > totalPages) return value;
              return next;
            })
          }
        >
          Next
        </button>
      </nav>
    </div>
  );
}
