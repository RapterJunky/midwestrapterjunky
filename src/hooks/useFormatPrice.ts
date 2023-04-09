import { useCallback } from "react";

const useFormatPrice = (currency: string) => {
  const formatPrice = useCallback(
    (value: number) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(value / 100),
    [currency]
  );

  return formatPrice;
};

export default useFormatPrice;
