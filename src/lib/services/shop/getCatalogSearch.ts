import SearchQuery, { type SearchQueryResult } from "@/gql/sqaure/searchQuery";
import getSquareQuery from "@/lib/services/store/GetSquareQuery";

type QueryParams = {
  query?: string;
  cursor?: string;
  sort?: string;
  vendor?: string;
  category?: string;
};

const VENDOR_ATTRIBUTE_ID = "KOVLYB64QOXCTHOVERBUXTIO";

const getCatalogSearch = async ({
  query,
  cursor,
  vendor,
  sort,
  category,
}: QueryParams) => {
  const {
    catalogItems: { pageInfo, nodes },
  } = await getSquareQuery<SearchQueryResult>(SearchQuery, {
    variables: {
      query,
      merchantId: process.env.SQAURE_MERCHANT_ID,
      cursor,
      category: category ? [category] : undefined,
      sort: sort === "latest" ? "name_DESC" : undefined,
      vendor: vendor
        ? [{ id: VENDOR_ATTRIBUTE_ID, string: vendor }]
        : undefined,
    },
  });

  switch (sort) {
    case "htl": {
      nodes.sort((a, b) => {
        const itemA =
          a.variations.find((value) => value.pricingType === "FIXED_PRICING")
            ?.priceMoney?.amount ?? 0;
        const itemB =
          b.variations.find((value) => value.pricingType === "FIXED_PRICING")
            ?.priceMoney?.amount ?? 0;
        return itemB - itemA;
      });
      break;
    }
    case "lth": {
      nodes.sort((a, b) => {
        const itemA =
          a.variations.find((value) => value.pricingType === "FIXED_PRICING")
            ?.priceMoney?.amount ?? 0;
        const itemB =
          b.variations.find((value) => value.pricingType === "FIXED_PRICING")
            ?.priceMoney?.amount ?? 0;
        return itemA - itemB;
      });
      break;
    }
    default:
      break;
  }

  return {
    pageInfo,
    nodes,
  };
};

export default getCatalogSearch;
