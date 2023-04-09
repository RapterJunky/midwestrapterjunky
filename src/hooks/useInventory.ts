import { type InventoryCount } from "square";
import { useMemo } from "react";
import useSWR from "swr";

const useInventory = (item: string | undefined) => {
  const { data, isLoading, error } = useSWR<
    InventoryCount[],
    Error | Response,
    [string | undefined]
  >([item], async ([key]) => {
    if (!key) throw new Error("No Key set");
    return fetch(`/api/shop/inventory?item=${key}`).then((value) =>
      value.json()
    ) as Promise<InventoryCount[]>;
  });

  const inStock = useMemo(() => {
    if (!data) return false;
    if (!data.length) return true;
    return data.some((value) => value.state === "IN_STOCK");
  }, [data]);

  return {
    inStock,
    inventory: data?.at(0),
    stockLoading: isLoading,
    stockError: error,
  };
};

export default useInventory;
