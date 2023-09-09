type PriceType =
  | {
      pricingType: "VARIABLE_PRICING";
      priceMoney: null;
    }
  | {
      priceMoney: {
        amount: number;
        currency: string;
      };
      pricingType: "FIXED_PRICING";
    };

export type CartQueryResult = {
  catalog: {
    nodes: Array<
      {
        id: string;
        item: {
          id: string;
          labelColor: string;
          name: string;
          variations: PriceType[];
          images: { url: string; name: string }[] | null;
        };
        name: string;
      } & PriceType
    >;
  };
  inventoryCounts: {
    nodes: {
      catalog: {
        id: string;
      };
      state: string;
      quantity: string;
    }[];
  };
};
/**
 * Varables
 * @example
 * $items: [ID!]
 * $merchantId: ID!
 */
const CartQuery = `
query CatalogQuery($merchantId: ID!, $items: [ID!]) {
    catalog(filter: {
      id:{
        equalToAnyOf: $items
      }
      merchantId: {
        equalToAnyOf: [$merchantId]
      }
    }){
      nodes {
          id
        ... on CatalogItemVariation {
          item {
            labelColor
            name
            id
            variations {
              priceMoney {
                amount
                currency
              }
              pricingType
            }
            images {
              url 
              name
            }
          }
          name 
          pricingType
          priceMoney {
            amount
            currency
          }
        }
        }
    }
    inventoryCounts(filter: {
      merchantId: { 
          equalToAnyOf: [$merchantId] 
      }
      catalog: {
        equalToAnyOf: $items
      }
    }){
      nodes {
        catalog {
          id
        }
        state
        quantity
      }
    }
  }
`;

export default CartQuery;
