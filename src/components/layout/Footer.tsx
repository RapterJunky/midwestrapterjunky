import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col-reverse justify-center sm:justify-start sm:flex-row flex-shrink-0 h-24 w-full items-center gap-6 bg-slate-100 px-8 text-xs font-normal not-italic text-gray-700">
      <div>
        © 2022-{new Date().getFullYear()}, Midwest Raptor Junkies
      </div>
      <div className="flex gap-2">
        <Link className="underline" href="/terms-of-service">Terms of Service</Link>
        •
        <Link className="underline" href="/privacy-policy">Privacy Policy</Link>
      </div>
    </footer>
  );
}
