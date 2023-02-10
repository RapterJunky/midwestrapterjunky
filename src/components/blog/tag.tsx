//import Link from "next/link";

const Tag = ({ text }: { text: string }) => (
  <span className="font-inter mr-3 text-sm font-medium uppercase text-red-600 hover:text-red-600">
    {text.split(" ").join("-")}
  </span>
);

export default Tag;
