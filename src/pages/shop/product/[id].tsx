import type { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";
import { Client, Environment, type CatalogCustomAttributeValue } from "square";
import { Listbox, Transition } from '@headlessui/react';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';

import { fetchCachedQuery } from "@/lib/cache";
import { FullPageProps } from "@/types/page";
import GenericPageQuery from "@/gql/queries/generic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SiteTags from "@/components/SiteTags";
import { logger } from "@/lib/logger";
import { HiChevronLeft, HiChevronRight, HiSearch, HiSelector } from "react-icons/hi";
import Image from "next/image";
import ShopNavbar from "@/components/shop/ShopNavbar";
import useInventory from "@/hooks/useInventory";
import useCatalog from "@/hooks/useCatalog";

interface Props extends FullPageProps {
    product: {
        id: string;
        updatedAt?: string;
        customAttributeValues?: Record<string, CatalogCustomAttributeValue> | null;
        name: string;
        description: string | null
        labelColor: string;
        images: { url: string; alt: string; }[] | null;
        category: {
            name: string;
            id: string;
        } | null;
        variations: any[]
    }
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (
    ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
    const slug = z.string().safeParse(ctx.params?.id);
    if (!slug.success) return { notFound: true };

    const client = new Client({
        accessToken: process.env.SQAURE_ACCESS_TOKEN,
        environment: process.env.SQUARE_MODE as Environment
    });

    const product = await client.catalogApi.retrieveCatalogObject(slug.data, true);

    if ("errors" in product.result) {
        logger.error(product.result.errors);
        return {
            notFound: true
        }
    }

    if (!product.result.object) throw new Error("No product was returned");
    if (product.result.object.isDeleted) return { notFound: true };

    const props = await fetchCachedQuery<Omit<Props, "product">>("GenericPage", GenericPageQuery);

    const { object, relatedObjects } = product.result;
    const { itemData, customAttributeValues, updatedAt, id } = object;

    let category = null;
    if (itemData?.categoryId && relatedObjects) {
        const item = relatedObjects.find(value => value.id == itemData.categoryId);
        if (item && item.categoryData && item.categoryData.name) {
            category = {
                name: item.categoryData.name,
                id: item.id
            }
        }
    }

    let images: { alt: string; url: string; }[] | null = null;
    if (itemData?.imageIds && relatedObjects) {
        images = itemData.imageIds.map(image => {
            const data = relatedObjects.find(item => item.id === image);
            if (!data || !data?.imageData) return null;
            return {
                url: data.imageData.url as string,
                alt: data.imageData.caption ?? data.imageData.name ?? "Product"
            }
        }).filter(Boolean);
    }

    const variations = [];
    if (itemData?.variations) {
        for (const variation of itemData?.variations) {
            if (!variation.itemVariationData) continue;
            const { itemVariationData } = variation;

            if (variation.isDeleted || !itemVariationData.sellable) continue;

            let price = "$??";
            if (!itemVariationData?.priceMoney) {
                const first = itemData.variations?.at(0)?.itemVariationData?.priceMoney;
                if (first) {
                    const formatter = new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: first.currency
                    });
                    price = formatter.format((Number(first.amount) ?? 0) / 100)
                }
            } else {
                const formatter = new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: itemVariationData?.priceMoney?.currency
                });
                price = formatter.format((Number(itemVariationData?.priceMoney?.amount) ?? 0) / 100)
            }



            variations.push({
                id: variation.id,
                name: itemVariationData?.name ?? null,
                sku: itemVariationData?.sku ?? null,
                ordinal: itemVariationData?.ordinal ?? 0,
                price,
                itemOptionValues: itemVariationData?.itemOptionValues ?? null
            });
        }
    }


    return {
        props: {
            ...props,
            product: {
                id,
                images,
                updatedAt,
                customAttributeValues: customAttributeValues ?? null,
                name: itemData?.name ?? "Product",
                description: itemData?.description ?? null,
                labelColor: itemData?.labelColor ?? "aabb33",
                category,
                variations
            }
        },
        revalidate: 200
    };
}

const Product: React.FC<Props> = ({ _site, navbar, product }) => {
    const { data, isLoading, error } = useCatalog({ category: product.category?.id ?? undefined, limit: 4 });
    const [variation, setVariation] = useState(product.variations[0]);
    const { inStock, stockError, stockLoading } = useInventory(variation.id);
    const [image, setImage] = useState<number>(0);
    const [dir, setDir] = useState<"slide-in-from-left" | "slide-in-from-right">("slide-in-from-left")
    const merchent = Object.values(product.customAttributeValues ?? {}).find(value => value.name === "Vendor" && value.type === "STRING");

    return (
        <div className="flex flex-col">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `${product.name} - Midwest Raptor Junkies` }]]} />
            <Navbar {...navbar} mode="none" />
            <main className="flex flex-col flex-grow w-full" style={{ minHeight: "calc(100vh - 88px)" }}>
                <ShopNavbar />
                <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
                    <div className="col-span-1 lg:col-span-8" style={{ backgroundColor: `#${product.labelColor}` }}>
                        <div className="flex flex-col justify-center">
                            <div className="flex-1 flex justify-center relative overflow-hidden">
                                <Image key={image} className={`h-full max-w-full block object-contain transition-transform animate-in ${dir}`} src={product.images?.at(image)?.url ?? `https://api.dicebear.com/6.x/icons/png?seed=${product.name}`} alt={product.images?.at(image)?.alt ?? "Product Image"} style={{ animationDuration: "400ms" }} height={600} width={600} sizes='((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em' />
                                <div className="absolute bottom-6 right-6 border border-black divide-x divide-black">
                                    <button type="button" className="px-9 py-2 hover:bg-black hover:bg-opacity-20" onClick={() => setImage((idx) => {
                                        const next = idx - 1;
                                        if (next < 0) return ((product.images?.length ?? 0) - 1) ?? 0;
                                        setDir("slide-in-from-left");
                                        return next;
                                    })}>
                                        <HiChevronLeft className="h-8 w-8" />
                                    </button>
                                    <button type="button" className="px-9 py-2 hover:bg-black hover:bg-opacity-20" onClick={() => setImage((idx) => {
                                        const next = idx + 1;
                                        if (next >= (product.images?.length ?? 0)) return 0;
                                        setDir("slide-in-from-right");
                                        return next;
                                    })}>
                                        <HiChevronRight className="h-8 w-8" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-opacity-20 bg-black h-32 w-full overflow-hidden">
                                {!product.images?.length ? (
                                    <button type="button" className="overflow-hidden w-60 h-full cursor-pointer bg-gray-300 bg-opacity-50 animate-in slide-in-from-right">
                                        <Image className="w-full h-full object-contain block max-w-full transition-transform hover:transform hover:scale-110" src={`https://api.dicebear.com/6.x/icons/png?seed=${product.name}`} alt="Product" height={600} width={600} sizes='((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em' />
                                    </button>
                                ) : product.images?.map((item, i) => (
                                    <button data-headlessui-state={image === i ? "selected" : undefined} type="button" key={i} className="overflow-hidden w-60 h-full cursor-pointer ui-selected:bg-gray-300 ui-selected:bg-opacity-50" onClick={() => setImage(i)}>
                                        <Image className="w-full h-full object-contain block max-w-full transition-transform hover:transform hover:scale-110" src={item.url} alt={item.alt} height={600} width={600} sizes='((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em' />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 lg:col-span-4 p-6 flex flex-col">
                        <h1 className="font-bold text-4xl">{product.name}{variation.sku ? <span className="text-gray-400 text-base">#{variation.sku}</span> : null}</h1>
                        <div className="flex gap-1 mb-4">
                            <span className="text-sm text-gray-600">{product.category?.name}</span>
                            {merchent?.stringValue ? <span className="text-sm text-gray-600">| {merchent?.stringValue}</span> : null}
                        </div>
                        <h3 className="text-xl font-semibold">{variation.price}</h3>

                        <p className="mt-4">{product.description}</p>

                        <div className="mt-4 flex flex-col">
                            <label className="mb-2 text-gray-500" htmlFor="options">Options</label>
                            <Listbox value={variation} onChange={setVariation}>
                                <div id="options" className="relative mt-1">
                                    <Listbox.Button className="relative form-select w-full text-left">
                                        <span className="block truncate">{variation.name}</span>
                                    </Listbox.Button>
                                    <Transition enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-out" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
                                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {product.variations.map(value => (
                                                <Listbox.Option className="relative cursor-default select-none py-2 pl-4 text-gray-900 hover:bg-gray-100" key={value.id} value={value}>
                                                    <span className="block truncate font-normal">{value.name}</span>
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>

                        <div className="mt-4 flex flex-col">
                            <label className="mb-2 text-gray-500" htmlFor="quantity">Quantity</label>
                            <input type="number" id="quantity" name="quantity" min={1} defaultValue={1} />
                        </div>

                        <div className="mt-4 lg:mt-auto">
                            <button disabled={!inStock || stockLoading} type="button" className="mb-2 text-center block w-full rounded bg-primary px-6 py-4 text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70">
                                {stockLoading ? "Loading..." : inStock ? "Add to cart" : "Sold out"}
                            </button>
                        </div>
                    </div>
                </div>
                <hr className="mt-7" />
                <section className="py-12 px-6 mb-10">
                    <h2 className="pt-1 pb-2 mb-2 font-bold text-xl">Related Products</h2>
                    <div className="grid  grid-cols-2 lg:grid-cols-4 py-2 gap-7">
                        {!data || isLoading ? (null) : data.result.map((item) => (
                            <div className="border border-gray-200 bg-gray-100" key={item.id}>
                                <Link href={`/shop/product/${item.id}`} aria-label={item.name} className="relative box-border inline-block max-h-full w-full cursor-pointer overflow-hidden bg-gray-100 transition-transform h-full animate-in fade-in">
                                    <div className="flex items-center justify-center h-full w-full overflow-hidden">
                                        <Image className="h-full w-full object-cover" src={item.image?.url ?? `https://api.dicebear.com/6.x/icons/png?seed=${item.name}`} alt={item.image?.alt ?? "Product Image"} height={540} width={540} sizes='((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em' />
                                    </div>
                                </Link>
                                <div className="flex justify-between w-full">
                                    <span className="line-clamp-1">{item.name}</span>
                                    <span>{item.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default Product;