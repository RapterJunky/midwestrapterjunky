export default function Footer() {
  return (
    <footer className="flex h-20 w-full items-center bg-slate-100 px-8">
      <div className="text-xs font-normal not-italic text-gray-700">
        © 2022-{new Date().getFullYear()}, Midwest Raptor Junkies
      </div>
    </footer>
  );
}
