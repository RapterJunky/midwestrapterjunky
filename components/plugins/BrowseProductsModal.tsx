import type { RenderModalCtx } from 'datocms-plugin-sdk';
import { Canvas, Spinner, Button, TextInput, SelectInput } from "datocms-react-ui";
import { useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import useStore, { ShopType } from '../../lib/hooks/plugins/useStore';
import { normalizeConfig } from '../../lib/utils/plugin/types';

const options: { value: ShopType, label: string; }[] = [
    { value: "shopify", label: "Shopify" },
    { value: "freewebstore", label: "Freewebstore" }
];

export default function BrowseProductsModel({ ctx }: { ctx: RenderModalCtx }) {
    const { shop, setShop, fetchProductByMatching, query, setQuery, status, products } = useStore(ctx);

    const config = normalizeConfig(ctx.plugin.attributes.parameters);
    
    useEffect(()=>{
      fetchProductByMatching(query);
    },[query,shop]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.target as HTMLFormElement);
      setQuery(data.get("sku")?.toString() ?? "")
    };
    
    return (
        <Canvas ctx={ctx}>
          <div className='max-h-52'>
            <form className='flex items-stretch' onSubmit={handleSubmit}>
             {!config.useOnlyStore ?  <SelectInput
                  options={options} 
                  isMulti={false}
                  className="mr-4 flex" 
                  id="shop-type" 
                  name="shop-type" 
                  onChange={ev=>setShop(ev?.value ?? "shopify")} 
                  value={options.find(option=>option.value===shop) ?? options[0]} /> : null }
              <TextInput
                placeholder="Search products... (ie. mens shirts)"
                id="sku"
                name="sku"
                className="flex-1 mr-4"
              />
              <Button
                type="submit"
                buttonType="primary"
                buttonSize="s"
                leftIcon={<FaSearch style={{ fill: "#fff" }}/>}
                className="text-white"
                disabled={status === 'loading'}
              >
                Search
              </Button>
            </form>
            <div className="relative" style={{ marginTop: "var(--spacing-l)" }}>
                { products ? <div className={`grid grid-cols-5 opacity-100 ease-in-out duration-[0.2s]${status === "loading" ? " opacity-50":"" }`} style={{ gap: "var(--spacing-m)" }}>
                  {products.map(({ type, product })=> {
                    return (
                      <div className="text-center p-1 pb-0 rounded border overflow-hidden cursor-pointer bg-transparent appearance-none hover:border-var-accent border-var-border"
                        key={product.handle}
                        onClick={() => ctx.resolve({ type, handle: product.handle })}>
                        <div className="block bg-cover pt-[100%]"
                          style={{ backgroundColor:"var(--light-bg-color)", backgroundImage: `url(${product.imageUrl})` }}/>
                        <div className="text-left flex-1" style={{ lineHeight: "1.2" }}>
                          <div className="text-ellipsis whitespace-nowrap overflow-hidden text-center" style={{ lineHeight: "1.2", margin: "var(--spacing-s) 0" }}>{product.title}</div>
                        </div>
                      </div>
                  )})} 
                </div> : null }
              {status === 'loading' ? (
                <div className="text-center h-52 flex items-center justify-center">
                  <Spinner size={25} placement="centered" />
                </div>
              ) : null}
              {status === 'success' && products && products.length === 0 ? (
                <div className="text-center h-52 flex items-center justify-center" style={{ backgroundColor: "var(--light-bg-color)", color: "var(--light-body-color)", fontSize: "var(--font-size-xl)" }}>No products found!</div>
              ) : null}
              {status === 'error' ? (
                <div className="text-center h-52 flex items-center justify-center" style={{ backgroundColor: "var(--light-bg-color)", color: "var(--light-body-color)", fontSize: "var(--font-size-xl)" }}>API call failed!</div>
              ) : null}
            </div>
          </div>
      </Canvas>
    );
}