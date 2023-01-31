import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaWrench,
  FaSync,
} from "react-icons/fa";
import useStore, { type ShopType } from "@hook/plugins/useStore";
import { normalizeConfig } from "@lib/utils/plugin/types";

interface Product {
  type: ShopType;
  handle: string;
}

const getValue = (ctx: RenderFieldExtensionCtx) => {
  const path = ctx.fieldPath.split(".");

  let container: { [key: string]: any } = ctx.formValues;

  for (const item of path) {
    container = container[item];
  }

  return JSON.parse((container as any) ?? null);
};

export default function ShopFieldExtension({
  ctx,
}: {
  ctx: RenderFieldExtensionCtx;
}) {
  const config = normalizeConfig(ctx.plugin.attributes.parameters);
  const [error, setError] = useState<string | undefined>();
  const product = getValue(ctx);
  const { shop, setShop, status, products, fetchProductByHandle } =
    useStore(config);

  useEffect(() => {
    try {
      setError(undefined);
      if (!product || !product?.value) return;

      const [storefront, tenant, item] = product?.value?.split("$");

      const store = config.storefronts.find(
        (value) => value.domain === tenant && value.type === storefront
      );
      if (!store || !item)
        throw new Error("No store front exists for this item!", {
          cause: "NO_STOREFRONT_FOUND",
        });

      setShop(store);

      fetchProductByHandle(item);
    } catch (error: any) {
      console.error(error);
      if (error instanceof Error && error.cause === "NO_STOREFRONT_FOUND") {
        setError(error.message);
      }
    }
  }, [product?.value]);

  const handleReset = () => ctx.setFieldValue(ctx.fieldPath, null);

  const handleOpenModel = async () => {
    const product = (await ctx.openModal({
      id: "browseProducts",
      title: "Browse products",
      width: "xl",
    })) as Product | null;

    if (product)
      ctx.setFieldValue(ctx.fieldPath, JSON.stringify({ value: product }));
  };

  return (
    <Canvas ctx={ctx}>
      {shop && product ? (
        <div
          className={`relative border border-var-border p-5 text-center opacity-100 transition-opacity duration-[0.2s] ease-in-out${
            status === "loading" ? " opacity-60" : ""
          }`}
        >
          {status === "error" ? (
            <div className="flex items-center">
              API Error! Could not fetch details for product:&nbsp;
              <code>
                {" "}
                {product.handle} on {product.type}
              </code>
            </div>
          ) : null}
          {products && products[0] ? (
            <div className="flex items-center">
              <div
                className="mr-5 w-36 rounded border-var-border bg-cover bg-center p-1 before:block before:pt-[100%]"
                style={{ backgroundImage: `url(${products[0].imageUrl})` }}
              />
              <div className="flex-1 text-left">
                <div className="mb-1 flex items-center gap-2 text-var-accent">
                  <a
                    className="text-sm font-bold hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={products[0].onlineStoreUrl}
                  >
                    {products[0].title}
                  </a>
                  <FaExternalLinkAlt className="text-sm" />
                </div>
                <div
                  className="mb-1 overflow-hidden text-var-light"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {products[0].description}
                </div>
                {products[0].productType ? (
                  <div>
                    <strong>Product Type:</strong>
                    &nbsp;
                    {products[0].productType}
                  </div>
                ) : null}
                <div>
                  <strong>Price:</strong>
                  &nbsp;
                  {products[0].priceRange.maxVariantPrice.amount !==
                  products[0].priceRange.minVariantPrice.amount ? (
                    <span>
                      <span>
                        {products[0].priceRange.minVariantPrice.currencyCode}
                        &nbsp;{products[0].priceRange.minVariantPrice.amount}
                      </span>
                      &nbsp; - &nbsp;
                      <span>
                        {products[0].priceRange.maxVariantPrice.currencyCode}
                        &nbsp;{products[0].priceRange.maxVariantPrice.amount}
                      </span>
                    </span>
                  ) : (
                    <span>
                      {products[0].priceRange.maxVariantPrice.currencyCode}
                      &nbsp;{products[0].priceRange.maxVariantPrice.amount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <button
            className="absolute top-5 right-5 cursor-pointer bg-none text-sm transition-opacity duration-[0.2s] ease-in-out hover:opacity-80"
            type="button"
            onClick={handleReset}
          >
            <FaTimesCircle />
          </button>
        </div>
      ) : (
        <div
          className="border border-dashed text-center"
          style={{
            padding: "var(--spacing-l)",
            borderColor: "var(--border-color)",
          }}
        >
          {error ? (
            <>
              <div
                className="mb-5"
                style={{ color: "var(--light-body-color)" }}
              >
                {error}
              </div>
              <Button
                onClick={handleReset}
                buttonSize="s"
                leftIcon={<FaSync />}
              >
                Reset Item
              </Button>
            </>
          ) : config.storefronts.length ? (
            <>
              <div
                className="mb-5"
                style={{ color: "var(--light-body-color)" }}
              >
                No product selected!
              </div>
              <Button
                onClick={handleOpenModel}
                buttonSize="s"
                leftIcon={<FaSearch />}
              >
                Browse products
              </Button>
            </>
          ) : (
            <>
              <div
                className="mb-5"
                style={{ color: "var(--light-body-color)" }}
              >
                No storefronts available.
              </div>
              <Button
                onClick={() =>
                  ctx.navigateTo(`/admin/plugins/${ctx.plugin.id}/edit`)
                }
                buttonSize="s"
                leftIcon={<FaWrench />}
              >
                Config storefronts
              </Button>
            </>
          )}
        </div>
      )}
    </Canvas>
  );
}
