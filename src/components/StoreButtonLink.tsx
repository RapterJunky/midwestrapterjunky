import Button from "./Button";
import useSWR from "swr";
import type { StoreItem } from "./content/FeaturedShopItems";

export default function StoreButtonLink(props: { value: string }) {
  const { data, error } = useSWR<StoreItem[], Response>(
    `/api/products?find=${btoa(props.value)}`,
    (key: string) => fetch(key).then((value) => value.json())
  );
  const loading = !data && !error;

  if (loading) return <div>Loading...</div>;
  if (error || !data || !data.length || "message" in data) return null;

  return (
    <Button full href={(data as any)?.at(0).onlineStoreUrl ?? "/404"} link>
      View Store Page
    </Button>
  );
}
