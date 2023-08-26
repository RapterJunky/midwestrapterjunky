import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet";

const Sidenav: React.FC = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-8 w-8" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>

                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}

export default Sidenav;