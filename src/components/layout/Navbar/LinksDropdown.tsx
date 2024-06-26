import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import IconLink from "@/components/ui/IconLink";
import type { LinkWithIcon } from "@/types/page";

const LinksDropdown: React.FC<{ links: LinkWithIcon[] }> = ({ links }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="px-1 font-bold uppercase text-inherit duration-inherit"
          aria-label="menu"
        >
          More <ChevronDown className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {links.map((link, i) => (
          <DropdownMenuItem key={i}>
            <IconLink {...link} className="px-2 font-bold uppercase" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LinksDropdown;
