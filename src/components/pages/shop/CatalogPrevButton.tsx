"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const CatalogPrevButton: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasCursor = !searchParams?.get("cursor");

  return (
    <Button
      onClick={() => router.back()}
      disabled={hasCursor}
      title="Prev Page"
    >
      Prev
    </Button>
  );
};

export default CatalogPrevButton;
