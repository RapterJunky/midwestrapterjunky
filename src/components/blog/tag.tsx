//import Link from "next/link";

const Tag = ({ text }: { text: string }) => (
  <span className="font-inter mr-3 text-sm font-medium uppercase text-blue-500 hover:text-blue-600">
    {text.split(" ").join("-")}
  </span>
);

export default Tag;
