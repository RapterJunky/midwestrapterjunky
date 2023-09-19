import type { Table } from "@tanstack/react-table";
import { Button, SelectInput } from "datocms-react-ui";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { User } from "./index";

const pageSizes = [
  { label: "Show 10", value: 10 },
  { label: "Show 20", value: 20 },
  { label: "Show 30", value: 30 },
  { label: "Show 40", value: 40 },
  { label: "Show 50", value: 50 },
];

const Pagination: React.FC<{ table: Table<User> }> = ({ table }) => {
  return (
    <div className="mt-4 flex items-center gap-2">
      <div className="flex gap-2">
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          buttonSize="xxs"
          buttonType="primary"
        >
          <FaChevronLeft />
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          buttonSize="xxs"
          buttonType="primary"
        >
          <FaChevronRight />
        </Button>
      </div>
      <div className="flex gap-1">
        <span>Page</span>
        <strong>{table.getState().pagination.pageIndex + 1}</strong>
        <span>of</span>
        <strong>{table.getPageCount()}</strong>
      </div>
      <SelectInput
        onChange={(e) => table.setPageSize(e?.value ?? 50)}
        value={
          pageSizes.find(
            (item) => item.value === table.getState().pagination.pageSize,
          ) ?? pageSizes[0]
        }
        options={pageSizes}
      />
    </div>
  );
};

export default Pagination;
