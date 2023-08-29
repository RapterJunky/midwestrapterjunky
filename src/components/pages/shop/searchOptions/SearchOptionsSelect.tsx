"use client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation";

const SearchOptionsSelect: React.FC<{ name: string; queryKey: string; items: { name: string; value: string; }[] }> = ({ name, queryKey, items }) => {
    const params = new URLSearchParams(window.location.search);
    const router = useRouter();
    return (
        <Select defaultValue="DEFAULT" onValueChange={(value) => {
            if (value === "DEFAULT") {
                params.delete(queryKey);
            } else {
                params.set(queryKey, value);
            }
            router.push(`/shop?${params.toString()}`);
        }}>
            <SelectTrigger>
                <SelectValue placeholder={name} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="DEFAULT">
                    {name}
                </SelectItem>
                {items.map((item, i) => (
                    <SelectItem key={i} value={item.value}>
                        {item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default SearchOptionsSelect;