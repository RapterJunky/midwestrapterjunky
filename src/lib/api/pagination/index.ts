export type {
  PageNumberPaginationOptions,
  PageNumberPaginationMeta,
  CursorPaginationOptions,
  CursorPaginationMeta,
} from "./types";
import { extension, paginate } from "./extension";

export default extension;

export { paginate };
