import Link from "next/link";
import getFeaturedItems from "@/lib/services/store/getFeaturedItems";
import { Button } from "@/components/ui/button";

const StoreButtonLink: React.FC<{ value: string }> = async (props) => {
  const products = await getFeaturedItems([
    { id: "1", item: { value: props.value } },
  ]);

  if (!products) return null;

  const product = products.at(0);
  if (!product) return null;

  return (
    <Button asChild>
      <Link href={product.onlineStoreUrl ?? "/404"}>View Store Page</Link>
    </Button>
  );
};

export default StoreButtonLink;
