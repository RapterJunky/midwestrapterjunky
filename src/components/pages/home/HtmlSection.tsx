import type { ModulerContent } from "@/types/page";
import HTMLReactParser from "html-react-parser";

const HtmlSection: React.FC<ModulerContent> = ({ content }) => {
  return <section>{HTMLReactParser(content as string)}</section>;
};
export default HtmlSection;
