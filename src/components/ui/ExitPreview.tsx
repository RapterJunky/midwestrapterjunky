import Link from "next/link";
import HiEyeOff from "@components/icons/HiEyeOff";

export default function ExitPreview() {
  return (
    <div className="fixed bottom-10 left-10 z-50">
      <div
        className="mb-4 rounded-lg flex items-center gap-1 bg-danger-100 px-6 py-5 text-base text-danger-700"
        role="alert">
        <HiEyeOff />
        <Link href="/api/exit-preview" prefetch={false} className="underline">Exit draft mode.</Link>
      </div>
    </div>

  );
}
