import type { RenderModalCtx } from "datocms-plugin-sdk";
import {
  Canvas,
  Spinner,
  Button,
  TextInput,
  SelectInput,
} from "datocms-react-ui";
import { useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import useStore from "@hook/plugins/useStore";
import { normalizeConfig } from "@utils/plugin/types";

const asOption = (arg: any) => {
  return { label: arg.label, value: arg.domain };
};

export default function BrowseProductsModel({ ctx }: { ctx: RenderModalCtx }) {
  const config = normalizeConfig(ctx.plugin.attributes.parameters);
  const {
    shop,
    setShop,
    fetchProductByMatching,
    query,
    setQuery,
    status,
    products,
  } = useStore(config);

  useEffect(() => {
    fetchProductByMatching(query);
  }, [query, shop, fetchProductByMatching]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    setQuery(data.get("sku")?.toString() ?? "");
  };

  return (
    <Canvas ctx={ctx}>
      {shop && config.storefronts.length ? (
        <div className="max-h-52">
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
                    (option) => option.domain === ev.value
                  )
                );
              }}
              value={asOption(
                config.storefronts.find(
                  (option) => option.domain === shop?.domain
                ) ?? config.storefronts[0]
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
              disabled={status === "loading"}
            >
              Search
            </Button>
          </form>
          <div className="relative" style={{ marginTop: "var(--spacing-l)" }}>
            {products ? (
              <div
                className={`grid grid-cols-5 opacity-100 ease-in-out duration-[0.2s]${
                  status === "loading" ? " opacity-50" : ""
                }`}
                style={{ gap: "var(--spacing-m)" }}
              >
                {products.map((product) => (
                  <div
                    className="cursor-pointer appearance-none overflow-hidden rounded border border-var-border bg-transparent p-1 pb-0 text-center hover:border-var-accent"
                    key={product.handle}
                    onClick={() =>
                      ctx.resolve(
                        `${shop?.type}$${shop?.domain}$${product.handle}`
                      )
                    }
                  >
                    <div
                      className="block bg-cover pt-[100%]"
                      style={{
                        backgroundColor: "var(--light-bg-color)",
                        backgroundImage: `url(${product.imageUrl})`,
                      }}
                    />
                    <div
                      className="flex-1 text-left"
                      style={{ lineHeight: "1.2" }}
                    >
                      <div
                        className="overflow-hidden text-ellipsis whitespace-nowrap text-center"
                        style={{
                          lineHeight: "1.2",
                          margin: "var(--spacing-s) 0",
                        }}
                      >
                        {product.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {status === "loading" ? (
              <div className="flex h-52 items-center justify-center text-center">
                <Spinner size={25} placement="centered" />
              </div>
            ) : null}
            {status === "success" && products && products.length === 0 ? (
              <div
                className="flex h-52 items-center justify-center text-center"
                style={{
                  backgroundColor: "var(--light-bg-color)",
                  color: "var(--light-body-color)",
                  fontSize: "var(--font-size-xl)",
                }}
              >
                No products found!
              </div>
            ) : null}
            {status === "error" ? (
              <div
                className="flex h-52 items-center justify-center text-center"
                style={{
                  backgroundColor: "var(--light-bg-color)",
                  color: "var(--light-body-color)",
                  fontSize: "var(--font-size-xl)",
                }}
              >
                API call failed!
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Canvas>
  );
}
