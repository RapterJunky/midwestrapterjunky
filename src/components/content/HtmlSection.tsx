import HTMLReactParser from "html-react-parser";

const HtmlSection: React.FC<{ content: string }> = ({ content }) => {
  return <section>{HTMLReactParser(content)}</section>;
};
export default HtmlSection;
