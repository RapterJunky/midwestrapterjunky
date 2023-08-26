import ConfirmationMessage from "@/components/pages/confirmation/ConfirmationMessage";
import getFullPageProps from "@/lib/cache/getFullPageProps";
import getGenericSeoTags from "@/lib/helpers/getGenericSeoTags";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const data = await getFullPageProps();
    return getGenericSeoTags({
        icons: data.site.faviconMetaTags,
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