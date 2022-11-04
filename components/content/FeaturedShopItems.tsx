import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import Button from "../Button";

interface FeatureShopItems {
    items: { id: string; item: string; }[]
}

export default function FeaturedShopItems(props: FeatureShopItems){
    return (
        <section className="flex flex-col h-96 bg-zinc-100">
            <div>

            </div>
            <Button>
                <HiChevronLeft/>
            </Button>
            <Button>
                <HiChevronRight/>
            </Button>
        </section>
    );
}