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

  const totalPages = Math.ceil(total / 5);
  const prevPage = currentPage - 1 > 0;
  const nextPage = currentPage + 1 <= totalPages;

  return (
    <div className="mt-auto space-y-2 pb-8 pt-6 md:space-y-5">
      <nav className="flex justify-between">
        <button
          data-cy="pagination-previous-page"
          aria-label="Previous Page"
          className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70"
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
          className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70"
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
