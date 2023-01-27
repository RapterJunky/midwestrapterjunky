import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas, Button } from 'datocms-react-ui';
import { useEffect } from 'react';
import { FaSearch, FaExternalLinkAlt, FaTimesCircle } from 'react-icons/fa';
import useStore, { type ShopType } from '@hook/plugins/useStore';
import { normalizeConfig } from '@lib/utils/plugin/types';

interface Product { type: ShopType, handle: string };

const getValue = (ctx: RenderFieldExtensionCtx) => {
    const path = ctx.fieldPath.split(".");

    let container: { [key: string]: any } = ctx.formValues;

    for(const item of path) {
        container = container[item];
    }   

    return JSON.parse(container as any ?? null);
}


export default function ShopFieldExtension({ctx}:{ ctx: RenderFieldExtensionCtx }){
    const config = normalizeConfig(ctx.plugin.attributes.parameters);
    const product = getValue(ctx);
    const { shop, setShop, status, products, fetchProductByHandle } = useStore(config);

    useEffect(()=>{
        if(!product || !product?.value) return;

        const [storefront,tenant,item] = product?.value?.split("$");

        const store = config.storefronts.find(value=>value.domain===tenant && value.type === storefront);
        if(!store || !item) return;

        setShop(store);

        fetchProductByHandle(item);
    },[product?.value]);

    const handleReset = () =>  ctx.setFieldValue(ctx.fieldPath,null);
    
    const handleOpenModel = async () => {
        const product = await ctx.openModal({
            id: 'browseProducts',
            title: 'Browse products',
            width: 'xl',
        }) as Product | null;

        if(product) ctx.setFieldValue(ctx.fieldPath,JSON.stringify({ value: product }));
    }

    return (
        <Canvas ctx={ctx}>
            { shop && product ? (
               <div className={`border border-var-border text-center p-5 opacity-100 relative transition-opacity duration-[0.2s] ease-in-out${status === "loading" ? " opacity-60" : ""}`}>
                    { status === "error" ? (
                        <div className='flex items-center'>
                            API Error! Could not fetch details for product:&nbsp;<code> {product.handle} on {product.type}</code>
                        </div>
                    ) : null}
                    { products && products[0] ? (
                        <div className='flex items-center'>
                            <div className="w-36 mr-5 bg-cover rounded bg-center border-var-border p-1 before:block before:pt-[100%]" style={{ backgroundImage: `url(${products[0].imageUrl})` }}/>
                            <div className="flex-1 text-left">
                                <div className="mb-1 text-var-accent flex gap-2 items-center">
                                    <a className="font-bold hover:underline text-sm" target="_blank" rel="noopener noreferrer"href={products[0].onlineStoreUrl}>{products[0].title}</a>
                                    <FaExternalLinkAlt className="text-sm"/>
                                </div>
                                <div className="text-var-light mb-1 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{products[0].description}</div>
                                { products[0].productType ? (
                                    <div>
                                        <strong>Product Type:</strong> 
                                        &nbsp;
                                        {products[0].productType}
                                    </div>
                                ) : null }
                                <div>
                                    <strong>Price:</strong>
                                    &nbsp;
                                    {products[0].priceRange.maxVariantPrice.amount !==
                                        products[0].priceRange.minVariantPrice.amount ? (
                                            <span>
                                                <span>{products[0].priceRange.minVariantPrice.currencyCode}&nbsp;{products[0].priceRange.minVariantPrice.amount}</span>
                                            &nbsp; - &nbsp;
                                                <span>{products[0].priceRange.maxVariantPrice.currencyCode}&nbsp;{products[0].priceRange.maxVariantPrice.amount}</span>
                                            </span>
                                        ) : (
                                            <span>{products[0].priceRange.maxVariantPrice.currencyCode}&nbsp;{products[0].priceRange.maxVariantPrice.amount}</span>
                                        )}
                                </div>
                            </div>
                        </div>
                    ) : null }
                     <button className="absolute top-5 right-5 bg-none transition-opacity ease-in-out duration-[0.2s] cursor-pointer hover:opacity-80 text-sm" type="button" onClick={handleReset}>
                        <FaTimesCircle/>
                    </button>
               </div>
            ) : (
                <div className="border border-dashed text-center" style={{ padding: "var(--spacing-l)", borderColor: "var(--border-color)" }}>
                    <div className="mb-5" style={{ color: "var(--light-body-color)" }}>No product selected!</div>
                    <Button onClick={handleOpenModel}  buttonSize='s' leftIcon={<FaSearch/>}>Browse products</Button>
                </div>
            )}
        </Canvas>
    );
}