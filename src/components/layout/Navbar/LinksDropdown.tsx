import { ChevronDown } from 'lucide-react';
import IconLink from "@/components/ui/IconLink";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { LinkWithIcon } from "@/types/page";

const LinksDropdown: React.FC<{ links: LinkWithIcon[] }> = ({ links }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="link" size="sm" className="uppercase font-bold px-1">
                    More <ChevronDown className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {links.map((link, i) => (
                    <DropdownMenuItem key={i}>
                        <IconLink {...link} className="uppercase font-bold px-2" />
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default LinksDropdown;