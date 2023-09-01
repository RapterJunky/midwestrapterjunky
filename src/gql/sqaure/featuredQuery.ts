export type FeaturedQueryResult = {
  catalog: {
    nodes: {
      id: string;
      title: string;
      images: { url: string; alt: string; }[] | null;
      variations: Array<{
        priceMoney: {
          amount: number,
          currency: string
        }, pricingType: "FIXED_PRICING"
      } | {
        priceMoney: null,
        pricingType: "VARIABLE_PRICING"
      }>
    }[]
  }
}

const FeaturedQuery = `
query MerchantsQuery($merchantId: ID!, $items: [ID!]) {
    catalog(
      filter: {
        includeDeleted: false,
        type: {
          equalToAnyOf: ITEM
        }
        id: {
          equalToAnyOf: $items
        }
        merchantId: { 
          equalToAnyOf: [ $merchantId ]
        }
      }
    ) {
      nodes {
        id 
        ... on CatalogItem { 
            title: name 
          images {
            url
            alt: name
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
  }
`;

export default FeaturedQuery;