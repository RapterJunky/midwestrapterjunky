import useSWR from "swr";
import Button from "@components/Button";
import type { StoreItem } from "@components/content/FeaturedShopItems";

export default function StoreButtonLink(props: { value: string }) {
  const { data, error } = useSWR<StoreItem[], Response, string>(
    `/api/products?find=${btoa(props.value)}`,
    (key) => fetch(key).then((value) => value.json()) as Promise<StoreItem[]>
  );
  const loading = !data && !error;

  if (loading) return <div>Loading...</div>;
  if (error || !data || !data.length || "message" in data) return null;

  return (
    <Button full href={data?.at(0)?.onlineStoreUrl ?? "/404"} link>
      View Store Page
    </Button>
  );
}
