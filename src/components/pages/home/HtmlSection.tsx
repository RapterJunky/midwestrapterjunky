import HTMLReactParser from "html-react-parser";
import type { ModulerContent } from "@/types/page";

const HtmlSection: React.FC<ModulerContent> = ({ content }) => {
  return <section>{HTMLReactParser(content as string)}</section>;
};
export default HtmlSection;
