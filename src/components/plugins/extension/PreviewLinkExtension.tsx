import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Button, ButtonLink, Canvas } from "datocms-react-ui";
import { useMemo } from "react";
import type { RevalidateSettings } from "@/app/api/revalidate/route";
import { capitlize } from "@/lib/utils/capitlize";
import { normalizeConfig } from "@/lib/utils/plugin/config";

interface Props {
  ctx: RenderFieldExtensionCtx;
}

type PreviewSingle = { type: "single"; data: string };
type PreviewMulti = { type: "multi"; data: { href: string; name: string }[] };
type IPreviewLink = PreviewSingle | PreviewMulti | null;

const getSettings = (value: unknown, slug: string): RevalidateSettings => {
  try {
    return (
      (JSON.parse(value as string) as RevalidateSettings) ?? {
        type: "page",
        slug: `/${slug}`,
      }
    );
  } catch (error) {
    console.error(error);
    return { type: "page", slug: `/${slug}` };
  }
};

const replaceVariables = (
  entityPath: string,
  attributes: object,
  locale: string | null,
) => {
  // patch bug
  let path = entityPath.replace("[title]", "[slug]") ?? "";
  Object.entries(attributes).forEach(([field, value]) => {
    if (path.includes(`[${field}]`)) {
      let localizedValue: string;
      if (
        typeof value === "object" &&
        value !== null &&
        locale !== null &&
        locale in value
      ) {
        localizedValue = (value as Record<string, string>)[locale] as string;
      } else {
        localizedValue = value as string;
      }
      path = path.replace(`[${field}]`, localizedValue);
    }
  });
  return path;
};

const PreviewLink: React.FC<Props> = ({ ctx }) => {
  const config = ctx.formValues[ctx.fieldPath];
  const { siteUrl, previewPath, previewSecret, revalidateToken } =
    normalizeConfig(ctx.plugin.attributes.parameters);
  const multiLang = ctx.site.attributes.locales.length > 1;
  const locale = ctx.locale;
  const attributes = useMemo(() => ctx.item?.attributes ?? {}, [ctx.item]);

  const previewHref = useMemo<IPreviewLink>(() => {
    const settings = getSettings(config, ctx.itemType.attributes.api_key);

    switch (settings.type) {
      case "page": {
        const path = replaceVariables(settings.slug, attributes, locale);
        const noSlashInstanceUrl = siteUrl.replace(/\/$/, "");
        const href = [
          noSlashInstanceUrl,
          previewPath,
          "?slug=",
          multiLang ? `/${locale}` : "",
          path,
          previewSecret ? `&secret=${previewSecret}` : "",
        ].join("");
        return { type: "single", data: href };
      }
      case "pages": {
        const slugs = settings.slugs.map((url) => {
          const path = replaceVariables(url, attributes, locale);
          const noSlashInstanceUrl = siteUrl.replace(/\/$/, "");
          const href = [
            noSlashInstanceUrl,
            previewPath,
            "?slug=",
            multiLang ? `/${locale}` : "",
            path,
            previewSecret ? `&secret=${previewSecret}` : "",
          ].join("");
          return {
            href,
            name: capitlize(url.replaceAll("-", " ").replaceAll("/", "")),
          };
        });

        return { type: "multi", data: slugs };
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
    config,
    ctx.itemType.attributes.api_key,
  ]);

  const forceUpdate = async () => {
    const request = await fetch(`/api/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${revalidateToken}`,
        "Content-Type": "application/json",
        "x-environment": "force-update",
        "x-site-id": "midwestraptor",
        "x-webhook-id": "force-update",
      },
      body: JSON.stringify({
        entity: {
          attributes: {
            id: ctx.item?.id,
            slug: ctx.formValues["slug"],
            revalidate: config,
          },
        },
      }),
    });
    if (request.ok) {
      return ctx.notice("Successfully, Updated").catch((e) => console.error(e));
    }

    ctx
      .alert("There was an error updating page")
      .catch((e) => console.error(e));
    console.error(request);
  };

  return (
    <Canvas ctx={ctx}>
      {ctx.itemStatus === "new" ? (
        "Must save the record at least once"
      ) : !previewHref ? (
        "This item does not support previewing!"
      ) : previewHref.type === "single" ? (
        <div className="flex flex-col gap-2">
          <ButtonLink
            href={previewHref.data}
            fullWidth
            buttonType="primary"
            target="_blank"
          >
            View Preview
          </ButtonLink>
          <Button fullWidth onClick={forceUpdate}>
            Force Update
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-dato-s">
          {previewHref.data.map((item, i) => (
            <ButtonLink
              key={i}
              href={item.href}
              fullWidth
              buttonType="primary"
              target="_blank"
            >
              View {item.name}
            </ButtonLink>
          ))}
        </div>
      )}
    </Canvas>
  );
};

export default PreviewLink;
