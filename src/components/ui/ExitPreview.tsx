import Link from "next/link";
import { EyeOff } from 'lucide-react';
import { Button } from "./button";

export default function ExitPreview() {
  return (
    <div className="fixed bottom-10 left-10 z-50">
      <Button
        variant="destructive"
        role="alert"
        asChild
      >
        <Link href="/api/disable-draft" prefetch={false}>
          <EyeOff className="mr-2" /> Exit draft mode.
        </Link>
      </Button>
    </div>
  );
}
