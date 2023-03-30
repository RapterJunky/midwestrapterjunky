import { ItemAttributes } from 'datocms-plugin-sdk/dist/types/SiteApiSchema';
import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, ButtonLink } from "datocms-react-ui";
import { useMemo } from 'react';
import { normalizeConfig } from '@/lib/utils/plugin/config';

import type { RevaildateSettings } from "@/pages/api/revalidate";
import { capitlize } from '@/lib/utils/capitlize';

interface Props {
    ctx: RenderFieldExtensionCtx
}

type PreviewSingle = { type: "single", data: string; };
type PreviewMulti = { type: "multi", data: { href: string; name: string; }[] }
type IPreviewLink = PreviewSingle | PreviewMulti | null;

const getSettings = (value: unknown, slug: string): RevaildateSettings => {
    try {
        return JSON.parse(value as string) as RevaildateSettings ?? { type: "page", slug: `/${slug}` };
    } catch (error) {
        console.error(error);
        return { type: "page", slug: `/${slug}` };
    }
}

const replaceVariables = (
    entityPath: string,
    attributes: ItemAttributes,
    locale: string | null,
) => {
    // patch bug
    let path = entityPath.replace("[title]", "[slug]") ?? '';
    Object.entries(attributes).forEach(([field, value]) => {
        if (path.includes(`[${field}]`)) {
            let localizedValue: string;
            if (
                typeof value === 'object' &&
                value !== null &&
                locale !== null &&
                locale in value
            ) {
                localizedValue = (value as any)[locale];
            } else {
                localizedValue = value as string;
            }
            path = path.replace(`[${field}]`, localizedValue);
        }
    });
    return path;
};

const PreviewLink: React.FC<Props> = ({ ctx }) => {
    const { siteUrl, previewPath, previewSecret } = normalizeConfig(ctx.plugin.attributes.parameters);
    const multiLang = ctx.site.attributes.locales.length > 1;
    const locale = ctx.locale;
    const attributes = useMemo(() => ctx.item?.attributes ?? {}, [ctx.item]);

    const previewHref = useMemo<IPreviewLink>(() => {
        const settings = getSettings(ctx.formValues[ctx.fieldPath], ctx.itemType.attributes.api_key);

        switch (settings.type) {
            case "page":
            case "page-cache": {
                const path = replaceVariables(settings.slug, attributes, locale);
                const noSlashInstanceUrl = siteUrl.replace(/\/$/, '');
                const href = [
                    noSlashInstanceUrl,
                    previewPath,
                    '?slug=',
                    multiLang ? `/${locale}` : '',
                    path,
                    previewSecret ? `&secret=${previewSecret}` : '',
                ].join('');
                return { type: "single", data: href };
            }
            case "pages": {
                const slugs = settings.slugs.map(url => {
                    const path = replaceVariables(url, attributes, locale);
                    const noSlashInstanceUrl = siteUrl.replace(/\/$/, '');
                    const href = [
                        noSlashInstanceUrl,
                        previewPath,
                        '?slug=',
                        multiLang ? `/${locale}` : '',
                        path,
                        previewSecret ? `&secret=${previewSecret}` : '',
                    ].join('');
                    return { href, name: capitlize(url.replaceAll("-", " ").replaceAll("/", "")) };
                });

                return { type: "multi", data: slugs }
            }
            default:
                return null;
        }
    }, [
        attributes,
        locale,
        multiLang,
        previewPath,
        previewSecret,
        siteUrl,
    ]);

    return (
        <Canvas ctx={ctx}>
            {ctx.itemStatus === "new" ? ('Must save the record at least once') : (
                !previewHref ? "This item does not support previewing!" : previewHref.type === "single" ? (
                    <ButtonLink href={previewHref.data} fullWidth buttonType="primary" target="_blank">View Preview</ButtonLink>
                ) : (
                    <div className="flex flex-col gap-dato-s">
                        {previewHref.data.map((item, i) => (
                            <ButtonLink key={i} href={item.href} fullWidth buttonType="primary" target="_blank">View {item.name}</ButtonLink>
                        ))}
                    </div>
                )
            )}
        </Canvas>
    );
}

export default PreviewLink;