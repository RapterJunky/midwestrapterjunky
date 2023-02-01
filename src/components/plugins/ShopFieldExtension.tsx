import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import get from "lodash.get";
import useSWR from "swr";
import {
  FaSearch,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaWrench,
  FaSync,
} from "react-icons/fa";
import { normalizeConfig } from "@lib/utils/plugin/types";

import ShopifyClient, {
  APIError,
  type Product as ShopifyProduct,
} from "@utils/plugin/ShopifyClient";
import { type VaildConfig } from "@utils/plugin/types";

export default function ShopFieldExtension({
  ctx,
}: {
  ctx: RenderFieldExtensionCtx;
}) {
  const config = normalizeConfig(ctx.plugin.attributes.parameters);
  const product = (JSON.parse(get(ctx.formValues, ctx.fieldPath) as string)
    ?.value ?? null) as string | null;
  const { data, isLoading, error } = useSWR<
    ShopifyProduct | null,
    APIError | Error,
    [string | null]
  >([product], async (args) => {
    if (!args[0]) return null;

    const [storefront, tenant, item] = args[0].split("$");

    if (!item)
      throw new APIError("Failed to find product source.", {
        cause: "INVAILD_ITEM_SOURCE",
      });

    const store = config.storefronts.find(
      (value) => value.domain === tenant && value.type === storefront
    );

    if (!store)
      throw new APIError("No store front exists for this item!", {
        cause: "NO_STOREFRONT_FOUND",
      });

    const client = new ShopifyClient({
      shopifyDomain: store.domain,
      storefrontAccessToken: store.token,
    });

    return client.productByHandle(item);
  });

  const handleReset = () => ctx.setFieldValue(ctx.fieldPath, null);

  const handleOpenModel = async () => {
    const product = (await ctx.openModal({
      id: "browseProducts",
      title: "Browse products",
      width: "xl",
    })) as string | null;
    if (product)
      ctx.setFieldValue(ctx.fieldPath, JSON.stringify({ value: product }));
  };

  if (!config.storefronts.length) {
    return (
      <Canvas ctx={ctx}>
        <div
          className="border text-center"
          style={{
            padding: "var(--spacing-l)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="mb-5" style={{ color: "var(--light-body-color)" }}>
            No storefronts available.
          </div>
          <Button
            onClick={() =>
              ctx.navigateTo(`/admin/plugins/${ctx.plugin.id}/edit`)
            }
            buttonSize="s"
            leftIcon={<FaWrench />}
          >
            Configure storefronts
          </Button>
        </div>
      </Canvas>
    );
  }

  return (
    <Canvas ctx={ctx}>
      {!isLoading && !error && data ? (
        <div className="relative border border-var-border p-5 text-center transition-opacity duration-[0.2s] ease-in-out">
          <RenderProduct data={data} handleReset={handleReset} />
        </div>
      ) : null}
      {!isLoading && !error && !data ? (
        <NoProduct handleOpenModel={handleOpenModel} />
      ) : null}
      {!isLoading && error && !data ? (
        <RenderError product={product} error={error} />
      ) : null}
    </Canvas>
  );
}

const RenderError = ({
  error,
  product,
}: {
  error: Error;
  product: string | null;
}) => {
  const message =
    error instanceof APIError
      ? error.message
      : "API Error! Could not fetch details for product:&nbsp;";
  const cause =
    error instanceof APIError ? (`Code: ${error.cause}` as string) : product;

  return (
    <div
      className="border text-center"
      style={{
        padding: "var(--spacing-l)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="mb-5" style={{ color: "var(--light-body-color)" }}>
        <h4 className="mb-2 font-bold">{message}</h4>
        <code className="text-sm">{cause}</code>
      </div>
      <Button onClick={() => {}} buttonSize="s" leftIcon={<FaSync />}>
        Reset Item
      </Button>
    </div>
  );
};

const NoProduct = ({ handleOpenModel }: { handleOpenModel: () => void }) => {
  return (
    <div
      className="border text-center"
      style={{
        padding: "var(--spacing-l)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="mb-5" style={{ color: "var(--light-body-color)" }}>
        No product selected!
      </div>
      <Button onClick={handleOpenModel} buttonSize="s" leftIcon={<FaSearch />}>
        Browse products
      </Button>
    </div>
  );
};

const RenderProduct = ({ data, handleReset }: any) => {
  return (
    <>
      <div className="flex items-center">
        <div
          className="mr-5 w-36 rounded border-var-border bg-cover bg-center p-1 before:block before:pt-[100%]"
          style={{ backgroundImage: `url(${data.imageUrl})` }}
        />
        <div className="flex-1 text-left">
          <div className="mb-1 flex items-center gap-2 text-var-accent">
            <a
              className="text-sm font-bold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href={data.onlineStoreUrl}
            >
              {data.title}
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
            {data.description}
          </div>
          {data.productType ? (
            <div>
              <strong>Product Type:</strong>
              &nbsp;
              {data.productType}
            </div>
          ) : null}
          <div>
            <strong>Price:</strong>
            &nbsp;
            {data.priceRange?.maxVariantPrice?.amount !==
            data.priceRange?.minVariantPrice?.amount ? (
              <span>
                <span>
                  {data.priceRange.minVariantPrice.currencyCode}
                  &nbsp;{data.priceRange.minVariantPrice.amount}
                </span>
                &nbsp; - &nbsp;
                <span>
                  {data.priceRange.maxVariantPrice.currencyCode}
                  &nbsp;{data.priceRange.maxVariantPrice.amount}
                </span>
              </span>
            ) : (
              <span>
                {data.priceRange.maxVariantPrice.currencyCode}
                &nbsp;{data.priceRange.maxVariantPrice.amount}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        className="absolute top-5 right-5 cursor-pointer bg-none text-sm transition-opacity duration-[0.2s] ease-in-out hover:opacity-80"
        type="button"
        onClick={handleReset}
      >
        <FaTimesCircle />
      </button>
    </>
  );
};
