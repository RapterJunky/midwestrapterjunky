import Button from "./Button";
import useSWR from "swr";
import type { ShopType } from "../lib/hooks/plugins/useStore";
import type { StoreItem } from "./content/FeaturedShopItems";

export default function StoreButtonLink(props: { handle: string; type: ShopType }){
    const { data, error } = useSWR<StoreItem[],Response>(`/api/products?find=${btoa(`${props.type[0]}:${props.handle}`)}`,(key: string)=>fetch(key).then(value=>value.json()));
    const loading = !data && !error;

    if(loading) {
        return <div>Loading...</div>
    }

    if(error || !data || "message" in data) return null;

    return (
        <Button full href={(data as any)?.at(0).onlineStoreUrl ?? "/404"} link>View Store Page</Button>
    );
}