import {
  Canvas,
  Spinner,
  Button,
  TextInput,
  SelectInput,
} from "datocms-react-ui";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import useSWR from "swr";

import {
  normalizeConfig,
  type StorefrontPluginConfig,
  type VaildConfig,
} from "@lib/utils/plugin/config";
import ShopifyClient from "@lib/plugin/ShopifyClient";
import SquareClient from "@lib/plugin/SquareClient";

type RequestValue = [string, string | undefined, string | undefined];

const asOption = (arg: StorefrontPluginConfig) => {
  return { label: arg.label, value: arg.domain };
};

export default function BrowseProductsModel({ ctx }: { ctx: RenderModalCtx }) {
  const config = normalizeConfig(ctx.plugin.attributes.parameters);
  const [shop, setShop] = useState<VaildConfig["storefronts"][0] | undefined>(
    config.storefronts[0],
  );
  const [query, setQuery] = useState<string>("");
  const { data, isLoading, error } = useSWR<
    Storefront.Product[],
    Error,
    RequestValue
  >([query, shop?.type, shop?.domain], ([search, type]) => {
    if (!shop)
      throw new Error("No storefront to use.", { cause: "NO_STOREFRONT" });

    switch (type) {
      case "SQ": {
        const client = new SquareClient(shop.domain, shop.token, shop.test);
        return client.productsMatching(search);
      }
      case "S": {
        const client = new ShopifyClient({
          shopifyDomain: shop.domain,
          storefrontAccessToken: shop.token,
        });
        return client.productsMatching(search);
      }
      default:
        throw new Error("Unable to process request.", {
          cause: "NO_STOREFRONT_HANDLER",
        });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    setQuery(data.get("sku")?.toString() ?? "");
  };

  return (
    <Canvas ctx={ctx}>
      {shop && config.storefronts.length ? (
        <div>
          <form className="flex items-stretch" onSubmit={handleSubmit}>
            <SelectInput
              options={config.storefronts.map((value) => asOption(value))}
              isMulti={false}
              className="mr-4 flex"
              id="shop-type"
              name="shop-type"
              onChange={(ev) => {
                if (!ev) return;
                setShop(
                  config.storefronts.find(
                    (option) => option.domain === ev.value,
                  ),
                );
              }}
              value={asOption(
                config.storefronts.find(
                  (option) => option.domain === shop?.domain,
                ) ?? (config.storefronts[0] as StorefrontPluginConfig),
              )}
            />
            <TextInput
              placeholder="Search products... (ie. mens shirts)"
              id="sku"
              name="sku"
              className="mr-4 flex-1"
            />
            <Button
              type="submit"
              buttonType="primary"
              buttonSize="s"
              leftIcon={<FaSearch style={{ fill: "#fff" }} />}
              className="text-white"
              disabled={isLoading}
            >
              Search
            </Button>
          </form>
          <div className="mt-dato-l relative">
            {!isLoading && !error && data?.length ? (
              <div
                className={`gap-dato-m grid grid-cols-5 opacity-100 duration-700 ease-in-out`}
              >
                {data.map((product) => (
                  <div
                    className="border-var-border hover:border-dato-accent cursor-pointer appearance-none overflow-hidden rounded border bg-transparent p-1 pb-0 text-center"
                    key={product.handle}
                    onClick={() =>
                      ctx.resolve(
                        `${shop?.type}$${shop?.domain}$${product.handle}`,
                      )
                    }
                  >
                    <div
                      className="bg-dato-light block bg-cover pt-[100%]"
                      style={{
                        backgroundImage: `url(${product.image.url})`,
                      }}
                    />
                    <div
                      className="flex-1 text-left"
                      style={{ lineHeight: "1.2" }}
                    >
                      <div
                        className="my-dato-s overflow-hidden text-ellipsis whitespace-nowrap text-center"
                        style={{
                          lineHeight: "1.2",
                        }}
                      >
                        {product.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {isLoading && !error ? (
              <div className="flex h-52 items-center justify-center text-center">
                <Spinner size={25} placement="centered" />
              </div>
            ) : null}
            {!isLoading && !error && !data?.length ? (
              <div
                className="bg-dato-light text-dato-light-body flex h-52 items-center justify-center text-center"
                style={{
                  fontSize: "var(--font-size-xl)",
                }}
              >
                No products found!
              </div>
            ) : null}
            {!isLoading && error ? (
              <div
                className="bg-dato-light text-dato-light-body flex h-52 items-center justify-center text-center"
                style={{
                  fontSize: "var(--font-size-xl)",
                }}
              >
                {error?.message ?? "API call failed!"}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Canvas>
  );
}
