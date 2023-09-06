export type SearchQueryResult = {
  catalogItems: {
    pageInfo: {
      nextCursor: null | string;
    };
    nodes: {
      id: string;
      name: string;
      updatedAt: string;
      images: { url: string; caption: string | null; name: string }[] | null;
      category: {
        name: string;
      } | null;
      variations: (
        | {
            priceMoney: {
              amount: number;
              currency: string;
            };
            pricingType: "FIXED_PRICING";
          }
        | {
            priceMoney: null;
            pricingType: "VARIABLE_PRICING";
          }
      )[];
    }[];
  };
};

/**
 * @example
 *  Varables
 *  Required
 *      $merchantId: ID!
 *  optional
 *      $limit: Int,
 *      $cursor: Cursor,
 *      $sort: [CatalogSort!],
 *      $vendor: [CatalogCustomAttributeFilter],
 *      $category: [ID!]
 */
const SearchQuery = `
query CatalogQuery(
    $merchantId: ID!,
    $limit: Int, 
    $query: String, 
    $cursor: Cursor,
    $sort: [CatalogSort!], 
    $vendor: [CatalogCustomAttributeFilter],
    $category: [ID!]
  ) {
        catalogItems(
        first: $limit, 
        after: $cursor, 
        orderBy: $sort, 
        filter: { 
          merchantId: {
            equalToAnyOf: [$merchantId]
          },
          text: $query, 
          categoryId: $category,
          customAttribute: $vendor
        }
      ){
        pageInfo {
          nextCursor: endCursor
        }
        nodes {
          id
          name
          updatedAt
          images {
            url
            caption
            name
          }
          category {
            name
          }
          variations {
            priceMoney {
              amount
              currency
            }
            pricingType
          }
        }
      }
  }
`;

export default SearchQuery;
