import {
  FaSearch,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaWrench,
  FaSync,
} from "react-icons/fa";
import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import get from "lodash.get";
import useSWR from "swr";

import ShopifyClient, { APIError } from "@/lib/plugin/ShopifyClient";
import { normalizeConfig } from "@/lib/utils/plugin/config";
import SquareClient from "@/lib/plugin/SquareClient";

export default function ShopFieldExtension({
  ctx,
}: {
  ctx: RenderFieldExtensionCtx;
}) {
  const config = normalizeConfig(ctx.plugin.attributes.parameters);
  const product =
    (
      JSON.parse(get(ctx.formValues, ctx.fieldPath) as string) as {
        value: string;
      }
    )?.value ?? null;
  const { data, isLoading, error } = useSWR<
    Storefront.Product | null,
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
      (value) => value.domain === tenant && value.type === storefront,
    );

    if (!store)
      throw new APIError("No store front exists for this item!", {
        cause: "NO_STOREFRONT_FOUND",
      });

    switch (store.type) {
      case "SQ": {
        const client = new SquareClient(store.domain, store.token, store.test);
        return client.productByHandle(item);
      }
      case "S": {
        const client = new ShopifyClient({
          shopifyDomain: store.domain,
          storefrontAccessToken: store.token,
        });
        return client.productByHandle(item);
      }

      default:
        throw new APIError("Unable to process request", {
          cause: "NO_STOREFRONT_HANDLER",
        });
    }
  });

  const handleReset = () =>
    ctx.setFieldValue(ctx.fieldPath, null).catch((e) => console.error(e));

  const handleOpenModel = async () => {
    const product = (await ctx.openModal({
      id: "browseProducts",
      title: "Browse products",
      width: "xl",
    })) as string | null;
    if (product)
      await ctx.setFieldValue(
        ctx.fieldPath,
        JSON.stringify({ value: product }),
      );
  };

  if (!config.storefronts.length) {
    return (
      <Canvas ctx={ctx}>
        <div
          className="border p-dato-l text-center"
          style={{
            borderColor: "var(--border-color)",
          }}
        >
          <div className="text-dato-light-body mb-5">
            No storefronts available.
          </div>
          <Button
            onClick={() =>
              ctx
                .navigateTo(`/admin/plugins/${ctx.plugin.id}/edit`)
                .catch((e) => console.error(e))
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
        <div className="border-var-border relative border p-5 text-center transition-opacity duration-200 ease-in-out">
          <RenderProduct data={data} handleReset={handleReset} />
        </div>
      ) : null}
      {!isLoading && !error && !data ? (
        <NoProduct handleOpenModel={handleOpenModel} />
      ) : null}
      {!isLoading && error && !data ? (
        <RenderError
          product={product}
          error={error}
          handleReset={handleReset}
        />
      ) : null}
    </Canvas>
  );
}

const RenderError: React.FC<{
  error: Error;
  product: string | null;
  handleReset: () => void;
}> = ({ error, product, handleReset }) => {
  const message =
    error instanceof APIError
      ? error.message
      : "API Error! Could not fetch details for product!";
  const cause =
    error instanceof APIError ? `Code: ${error?.cause as string}` : product;

  return (
    <div
      className="border p-dato-l text-center"
      style={{
        borderColor: "var(--border-color)",
      }}
    >
      <div className="text-dato-light-body mb-5">
        <h4 className="mb-2 font-bold">{message}</h4>
        <code className="text-sm">{cause}</code>
      </div>
      <Button onClick={handleReset} buttonSize="s" leftIcon={<FaSync />}>
        Reset Item
      </Button>
    </div>
  );
};

const NoProduct = ({ handleOpenModel }: { handleOpenModel: () => void }) => {
  return (
    <div
      className="border p-dato-l text-center"
      style={{
        borderColor: "var(--border-color)",
      }}
    >
      <div className="text-dato-light-body mb-5">No product selected!</div>
      <Button onClick={handleOpenModel} buttonSize="s" leftIcon={<FaSearch />}>
        Browse products
      </Button>
    </div>
  );
};

const RenderProduct: React.FC<{
  data: Storefront.Product;
  handleReset: () => void;
}> = ({ data, handleReset }) => {
  return (
    <>
      <div className="flex items-center">
        <div
          className="border-var-border mr-5 w-36 rounded bg-cover bg-center p-1 before:block before:pt-[100%]"
          style={{ backgroundImage: `url(${data.image.url})` }}
        />
        <div className="flex-1 text-left">
          <div className="text-dato-accent mb-1 flex items-center gap-2">
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
          <div className="text-var-light mb-1 line-clamp-2 overflow-hidden">
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
        className="absolute right-5 top-5 cursor-pointer bg-none text-sm transition-opacity duration-200 ease-in-out hover:opacity-80"
        type="button"
        onClick={handleReset}
      >
        <FaTimesCircle />
      </button>
    </>
  );
};
