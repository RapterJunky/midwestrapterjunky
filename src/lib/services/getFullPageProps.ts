import "server-only";
import getPageQuery from "./GetPageQuery";
import GenericPageQuery, {
  type GenericPageResult,
} from "@query/queries/generic";

const getFullPageProps = () =>
  getPageQuery<GenericPageResult>(GenericPageQuery, {
    revalidate: { tags: ["navbar"] },
  });

export default getFullPageProps;
