import HTMLReactParser from "html-react-parser";

export default function HtmlSection({ content }: any) {
  return <section>{HTMLReactParser(content)}</section>;
}
