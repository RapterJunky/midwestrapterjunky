import "server-only";
import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@/types/page";
import getPageQuery from "./GetPageQuery";

const getFullPageProps = getPageQuery<FullPageProps>(GenericPageQuery);

export default getFullPageProps;
