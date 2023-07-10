import useSWR from "swr";
import Button from "@/components/ui/Button";

const StoreButtonLink: React.FC<{ value: string }> = (props) => {
  const { data, error } = useSWR<Storefront.Product[], Response, string>(
    `/api/products?find=${btoa(props.value)}`,
    (key) =>
      fetch(key).then((value) => value.json()) as Promise<Storefront.Product[]>,
  );
  const loading = !data && !error;

  if (loading) return <div>Loading...</div>;
  if (error || !data || !data.length || "message" in data) return null;

  return (
    <Button full href={data?.at(0)?.onlineStoreUrl ?? "/404"} link>
      View Store Page
    </Button>
  );
};

export default StoreButtonLink;
