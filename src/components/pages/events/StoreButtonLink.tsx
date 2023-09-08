import { Button } from "@/components/ui/button";
import { REVAILDATE_IN_2H } from "@/lib/revaildateTimings";
import Link from "next/link";

const StoreButtonLink: React.FC<{ value: string }> = async (props) => {
  const data = (await fetch(
    `${process.env.VERCEL_ENV === "development" ? "http" : "https"}://${
      process.env.VERCEL_URL
    }/api/products?find=${btoa(props.value)}`,
    {
      next: {
        revalidate: REVAILDATE_IN_2H,
      },
    },
  ).then((value) => value.json())) as Storefront.Product[];

  if (!data || !data.length || "message" in data) return null;

  return (
    <Button asChild>
      <Link href={data?.at(0)?.onlineStoreUrl ?? "/404"}>View Store Page</Link>
    </Button>
  );
};

export default StoreButtonLink;
