import type { Metadata, ResolvingMetadata } from "next";

import ConfirmationMessage from "@/components/pages/confirmation/ConfirmationMessage";
import getGenericSeoTags from "@/lib/helpers/getGenericSeoTags";

export async function generateMetadata({ }, parent: ResolvingMetadata): Promise<Metadata> {
    const icons = (await parent).icons;

    return getGenericSeoTags({
        icons,
        title: "Confirmation",
        robots: false,
        description: "Confirmation page",
    })
}

const Confirmation: React.FC = () => {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="prose text-center md:prose-lg">
                <ConfirmationMessage />
            </div>
        </div>
    );
}

export default Confirmation;