import type { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";
import { Client, Environment, type CatalogObject, type CatalogMeasurementUnit, type CatalogPricingRule, type CatalogProductSet, type CatalogCustomAttributeValue } from "square";
import superjson from "superjson";
import { z } from 'zod';

import { fetchCachedQuery } from "@/lib/cache";
import { FullPageProps } from "@/types/page";
import GenericPageQuery from "@/gql/queries/generic";
import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SiteTags from "@/components/SiteTags";
import { logger } from "@/lib/logger";

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
    old: any;
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


    const { json } = superjson.serialize(product.result);

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
                variations: itemData?.variations?.map(item => {
                    if (item.isDeleted || !item.itemVariationData?.sellable) return null;

                    let price = "$??";
                    if (!item.itemVariationData?.priceMoney) {
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
                            currency: item.itemVariationData?.priceMoney?.currency
                        });
                        price = formatter.format((Number(item.itemVariationData.priceMoney.amount) ?? 0) / 100)
                    }

                    return {
                        id: item.id,
                        name: item.itemVariationData?.name,
                        sku: item.itemVariationData?.sku,
                        ordinal: item.itemVariationData?.ordinal,
                        price,
                        itemOptionValues: item.itemVariationData?.itemOptionValues ?? null

                    }
                }).filter(Boolean) ?? []
            },
            old: json
        },
        revalidate: 200
    };
}

const Product: React.FC<Props> = ({ _site, navbar, product, old }) => {
    const router = useRouter();
    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `${product.name} - Midwest Raptor Junkies` }]]} />
            <Navbar {...navbar} mode="none" />
            <main className="flex flex-col flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full">
                    <div className="col-span-1 lg:col-span-8" style={{ backgroundColor: `#${product.labelColor}` }}>
                        <div>

                        </div>
                        <div>

                        </div>
                    </div>
                    <div className="col-span-1 lg:col-span-4 p-6">
                        <h1 className="font-bold text-4xl">{product.name}</h1>
                        <span className="text-sm text-gray-600">{product.category?.name}</span>
                        <p className="mt-4">{product.description}</p>

                        <div className="mt-4 flex flex-col">
                            <label className="mb-2 text-gray-500" htmlFor="options">Options</label>
                            <select id="options">
                                {product.variations.map(value => (
                                    <option>{value.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4">
                            <button type="button" className="mb-2 block w-full rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">
                                Add to cart
                            </button>
                        </div>
                    </div>
                </div>
                <hr />
                <div>

                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Product;