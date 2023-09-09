import type { InventoryCount } from "square";
import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api/fetcher";

const useInventory = (item: string | undefined) => {
  const { data, isLoading, error } = useSWR<
    InventoryCount[],
    Response,
    [string, string] | null
  >(item ? ["/api/shop/inventory", item] : null, ([url, item]) =>
    fetcher(`${url}?item=${item}`),
  );

  const inStock = useMemo(() => {
    if (!data) return false;
    if (!data.length) return true;
    return data.some(
      (value) =>
        value.state === "IN_STOCK" &&
        !Number.isNaN(value.quantity) &&
        Number(value.quantity) > 0,
    );
  }, [data]);

  return {
    inStock,
    inventory: data?.at(0),
    stockLoading: isLoading,
    stockError: error,
  };
};

export default useInventory;
