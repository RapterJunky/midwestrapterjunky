import ConfirmationMessage from "./ConfirmationMessage";
import type { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return getSeoTags({
    parent,
    seo: {
      title: "Confirmation",
      robots: false,
      description: "Confirmation page",
      slug: "/confirmation",
    },
  });
}

const Confirmation: React.FC = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="prose text-center md:prose-lg">
        <Suspense>
          <ConfirmationMessage />
        </Suspense>
      </div>
    </div>
  );
};

export default Confirmation;
