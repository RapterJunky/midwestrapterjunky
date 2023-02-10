import Link from "next/link";
import { HiEyeOff } from "react-icons/hi";

export default function ExitPreview() {
  return (
    <Link
      role="button"
      data-cy="exit-preview"
      aria-label="Exit Preview"
      type="button"
      href="/api/exit-preview"
      className="fixed bottom-10 left-10 z-50 inline-block rounded-full bg-red-600 p-3 text-lg font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg"
    >
      <HiEyeOff />
    </Link>
  );
}
