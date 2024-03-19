"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchOptionsSelect: React.FC<
  React.PropsWithChildren<{
    name: string;
    queryKey: string;
  }>
> = ({ name, queryKey, children }) => {
  const params = useSearchParams();
  const router = useRouter();
  return (
    <Select
      defaultValue="DEFAULT"
      onValueChange={(value) => {
        const nextParams = new URLSearchParams(params.toString());
        if (value === "DEFAULT") {
          nextParams.delete(queryKey);
        } else {
          nextParams.set(queryKey, value);
        }
        router.push(`/shop?${nextParams.toString()}`);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={name} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
};

export default SearchOptionsSelect;
