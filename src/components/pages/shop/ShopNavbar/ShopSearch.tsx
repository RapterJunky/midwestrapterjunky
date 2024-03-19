"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ShopSearch: React.FC = () => {
  const router = useRouter();
  return (
    <form
      className="relative order-2 flex w-full items-center lg:order-none lg:col-start-2"
      onSubmit={(ev) => {
        ev.preventDefault();

        const data = new FormData(ev.target as HTMLFormElement);
        const query = data.get("query")?.toString();
        const search = new URLSearchParams(window.location.search);

        if (query) {
          search.set("query", query);
          return router.push(`/shop?${search.toString()}`);
        }

        search.delete("query");
        router.push(`/shop?${search.toString()}`);
      }}
    >
      <div className="flex w-full items-center space-x-2">
        <Input
          className="w-full"
          id="search"
          data-cy="shop-search-input"
          minLength={3}
          type="text"
          enterKeyHint="search"
          name="query"
          placeholder="Search for products..."
        />
        <Button>
          <Search className="mr-2" type="submit" /> Search
        </Button>
      </div>
    </form>
  );
};

export default ShopSearch;
