import Link from "next/link";

const Tag = ({ text }: { text: string }) => (
    <Link href={`/`} className="mr-3 text-sm font-semibold uppercase text-teal-500 hover:text-teal-600">
        {text.split(' ').join('-')}
    </Link>
);

export default Tag;