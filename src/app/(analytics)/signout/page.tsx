import type { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SignoutBtn from "@components/pages/signout/SignoutBtn";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  { },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return getSeoTags({
    parent,
    seo: {
      robots: false,
      slug: "/signout",
      description: "Signout page for Midwest Raptor Junkies.",
      title: "Signout"
    }
  });
}

const Page: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center bg-neutral-200">
      <Card>
        <CardHeader>
          <CardTitle>Signout</CardTitle>
          <CardDescription>Are you sure you want to sign out?</CardDescription>
        </CardHeader>
        <CardFooter>
          <Suspense fallback={<span>Loading...</span>}>
            <SignoutBtn />
          </Suspense>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
