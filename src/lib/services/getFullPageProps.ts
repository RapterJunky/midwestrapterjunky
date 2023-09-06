import "server-only";
import GenericPageQuery, { type GenericPageResult } from "@query/queries/generic";
import getPageQuery from "./GetPageQuery";

const getFullPageProps = () => getPageQuery<GenericPageResult>(GenericPageQuery);

export default getFullPageProps;
