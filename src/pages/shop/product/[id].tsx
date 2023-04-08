import type { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";
import { Client, Environment, type CatalogCustomAttributeValue } from "square";
import { useForm, Controller } from 'react-hook-form';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { Listbox, Transition } from '@headlessui/react';
import { useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { z } from 'zod';

import ShopNavbar from "@components/shop/ShopNavbar";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import SiteTags from "@components/SiteTags";

import useInventory from "@hook/useInventory";
import useCatalog from "@hook/useCatalog";
import useCart, { CartProvider } from "@hook/useCart";

import { FullPageProps, NextPageWithProvider } from "@type/page";
import GenericPageQuery from "@/gql/queries/generic";
import { fetchCachedQuery } from "@lib/cache";
import { logger } from "@lib/logger";
import useFormatPrice from "@/hooks/useFormatPrice";

interface Props extends FullPageProps {
    product: {
        id: string;
        updatedAt?: string;
        customAttributeValues?: Record<string, CatalogCustomAttributeValue> | null;
        name: string;
        description: string | null
        labelColor: string;
        images: { url: string; alt: string; }[];
        category: {
            name: string;
            id: string;
        } | null;
        variations: {
            id: string;
            name: string | null;
            sku: string | null;
            ordinal: number;
            price: number;
            currency: string;
            pricingType: string;
            itemOptionValues: any[] | null;
        }[]
    }
}

type FormState = {
    quantity: number | string;
    variation: Props["product"]["variations"][0]
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

    let images: { alt: string; url: string; }[] = [];
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

    if (!images.length) {
        images = [
            { url: `https://api.dicebear.com/6.x/icons/png?seed=${itemData?.name!}`, alt: "Product Image" }
        ]
    }

    const variations = [];
    if (itemData?.variations) {
        for (const variation of itemData?.variations) {
            if (!variation.itemVariationData) continue;
            const { itemVariationData } = variation;

            if (variation.isDeleted || !itemVariationData.sellable) continue;

            let price: number = 999999;
            let currency = "USD";
            if (!itemVariationData?.priceMoney) {
                const first = itemData.variations?.at(0)?.itemVariationData?.priceMoney;
                if (first) {
                    price = Number(first.amount);
                    currency = first.currency ?? "USD";
                }
            } else {
                currency = itemVariationData.priceMoney.currency ?? "USD";
                price = Number(itemVariationData?.priceMoney?.amount);
            }

            variations.push({
                id: variation.id,
                name: itemVariationData?.name ?? null,
                sku: itemVariationData?.sku ?? null,
                ordinal: itemVariationData?.ordinal ?? 0,
                price,
                pricingType: itemVariationData?.pricingType!,
                currency,
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

const Product: NextPageWithProvider<Props> = ({ _site, navbar, product }) => {
    const { addToCart, openCart } = useCart();
    const { data, isLoading, error } = useCatalog({ category: product.category?.id ?? undefined, limit: 4 });
    const { control, handleSubmit, watch, register, formState: { isSubmitting } } = useForm<FormState>({
        defaultValues: {
            quantity: 1,
            variation: product.variations[0]!
        }
    });
    const variation = watch("variation");
    const { inStock, stockError, stockLoading, inventory } = useInventory(variation.id);
    const formatPrice = useFormatPrice(variation.currency);
    const [image, setImage] = useState<number>(0);
    const [dir, setDir] = useState<"slide-in-from-left" | "slide-in-from-right">("slide-in-from-left")
    const merchent = Object.values(product.customAttributeValues ?? {}).find(value => value.name === "Vendor" && value.type === "STRING");

    const add = (state: FormState) => {
        addToCart({
            labelColor: product.labelColor,
            id: product.id,
            name: product.name,
            image: product?.images.at(0)!,
            price: state.variation.price,
            quantity: parseInt(state.quantity as string),
            currency: state.variation.currency,
            option: {
                pricingType: state.variation.pricingType,
                id: state.variation.id,
                name: state.variation?.name ?? state.variation?.sku ?? ""
            }
        });
        openCart();
    }

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
                    <form className="col-span-1 lg:col-span-4 p-6 flex flex-col" onSubmit={handleSubmit(add)}>
                        <h1 className="font-bold text-4xl">{product.name}{variation.sku ? <span className="text-gray-400 text-base">#{variation.sku}</span> : null}</h1>
                        <div className="flex gap-1 mb-4">
                            <span className="text-sm text-gray-600">{product.category?.name}</span>
                            {merchent?.stringValue ? <span className="text-sm text-gray-600">| {merchent?.stringValue}</span> : null}
                        </div>
                        <h3 className="text-xl font-semibold">{formatPrice(variation.price)}</h3>

                        <p className="mt-4">{product.description}</p>

                        <div className="mt-4 flex flex-col">
                            <label className="mb-2 text-gray-500" htmlFor="options">Options</label>
                            <Controller control={control} name="variation" render={({ field }) => (
                                <Listbox value={field.value} onChange={field.onChange}>
                                    <div id="options" className="relative mt-1">
                                        <Listbox.Button className="relative form-select w-full text-left">
                                            <span className="block truncate">{field.value.name}</span>
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
                            )} />
                        </div>

                        <div className="mt-4 flex flex-col">
                            <label className="mb-2 text-gray-500" htmlFor="quantity">Quantity</label>
                            <input {...register("quantity")} type="number" id="quantity" name="quantity" min={1} defaultValue={1} max={inventory?.quantity ?? undefined} />
                        </div>

                        <div className="mt-4 lg:mt-auto">
                            <button type="submit" disabled={!inStock || stockLoading || isSubmitting} className="mb-2 text-center block w-full rounded-sm bg-primary px-6 py-4 text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70">
                                {stockLoading ? "Loading..." : inStock ? "Add to cart" : "Out of stock"}
                            </button>
                        </div>
                    </form>
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

Product.provider = CartProvider;

export default Product;