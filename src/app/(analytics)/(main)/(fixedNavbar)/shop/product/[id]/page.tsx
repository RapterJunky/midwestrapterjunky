import { notFound } from "next/navigation";
import { Product } from 'schema-dts';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';

import RelatedProductsFallback from "@/components/pages/shop/product/RelatedProductsFallback";
import RelatedProducts from "@/components/pages/shop/product/RelatedProducts";
import ProductImages from "@/components/pages/shop/product/ProductImages";
import ProductForm from "@/components/pages/shop/product/ProductForm";
import getGenericSeoTags from '@/lib/helpers/getGenericSeoTags';
import getFullPageProps from '@/lib/cache/getFullPageProps';
import { Separator } from "@/components/ui/separator";
import getProduct from "@/lib/shop/getProduct";

type PageParams = {
    params: { id: string }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const product = await getProduct(params.id);
    const props = await getFullPageProps();

    return getGenericSeoTags({
        icons: props.site.faviconMetaTags,
        title: product?.name ?? "MRJ Product",
        description: product?.description ?? "No product description",
        url: `https://midestraptorjunkies.com/shop/product/${params.id}`,
    });
}

const Product: React.FC<PageParams> = async ({ params }) => {

    const product = await getProduct(params.id);
    if (!product) notFound();

    const jsonld: Product = {
        "@type": "Product",
        image: product.images.at(0)?.url,
        category: product.category?.name,
        description: product.description,
        name: product.name,
        offers: product.variations.length ? {
            "@type": "Offer",
            priceCurrency: product.variations.at(0)?.currency,
            price: ((product.variations.at(0)?.price ?? 0) / 100).toString(),
            seller: product.merchent ? {
                "@type": "Organization",
                name: product.merchent
            } : undefined
        } : undefined
    }

    return (
        <div className="flex w-full flex-grow flex-col" style={{ minHeight: "calc(100vh - 88px)" }}>
            <Script type="application/ld+json" id={product.id}>
                {JSON.stringify(jsonld)}
            </Script>
            <div className="grid h-full w-full grid-cols-1 lg:grid-cols-12">
                <div className="col-span-1 lg:col-span-8" style={{ backgroundColor: `#${product.labelColor}` }}>
                    <ProductImages name={product.name} images={product.images} />
                </div>
                <ProductForm id={product.id} variations={product.variations} merchent={product.merchent} category={product.category?.name} name={product.name} description={product.description} />
            </div>
            <Separator className="mt-7" />
            <section className="mb-10 px-6 py-12">
                <h2 className="mb-2 pb-2 pt-1 text-xl font-bold">Related Products</h2>
                <div className="grid  grid-cols-2 gap-7 py-2 lg:grid-cols-4">
                    <Suspense fallback={<RelatedProductsFallback />}>
                        <RelatedProducts id={product.id} category={product.category?.id} />
                    </Suspense>
                </div>
            </section>
        </div>
    );
}

export default Product;