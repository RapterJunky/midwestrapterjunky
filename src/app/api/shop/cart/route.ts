import { NextResponse } from "next/server";
import createHttpError from "http-errors";
import CartQuery, { type CartQueryResult } from "@/gql/sqaure/cartQuery";
import getSquareQuery from "@/lib/services/shop/GetSquareQuery";
import onError from "@/lib/api/handleError";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cart = searchParams.get("cart")?.toString();

    const items = cart?.split(",");

    if (!items || !items.length) throw createHttpError.BadRequest();

    if (!cart) throw createHttpError.BadRequest();

    const { catalog, inventoryCounts } = await getSquareQuery<CartQueryResult>(
      CartQuery,
      {
        variables: {
          merchantId: process.env.SQAURE_MERCHANT_ID,
          items,
        },
      },
    );

    const data = catalog.nodes.map((value) => {
      let price = value.priceMoney;
      if (value.pricingType === "VARIABLE_PRICING") {
        const rootPrice = value.item.variations.find(
          (value) => value.pricingType === "FIXED_PRICING",
        );
        price = rootPrice?.priceMoney ?? { amount: 99999, currency: "USD" };
      }

      const inventory = inventoryCounts.nodes.find(
        (item) => item.catalog.id === value.id,
      );

      let max = null;
      if (!Number.isNaN(inventory?.quantity)) {
        const item = Number(inventory?.quantity);

        max = item < 0 ? 0 : item;
      }

      return {
        id: value.id,
        parentId: value.item.id,
        labelColor: value.item.labelColor,
        name: value.item.name,
        variation: value.name,
        image: value.item.images?.at(0) ?? {
          url: `https://api.dicebear.com/6.x/icons/png?seed=${value.item.name}`,
          name: value.item.name,
        },
        maxQuantity: max,
        state: inventory?.state ?? "IN_STOCK",
        price,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return onError(error);
  }
}
