import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import type { ItemAttributes } from 'datocms-plugin-sdk/dist/types/SiteApiSchema';
import type { Parameters } from './ConfigScreen';

import { ButtonLink, Canvas , Button} from 'datocms-react-ui';
import { useMemo, useState } from 'react';

interface PreviewLinkProps {
    ctx: RenderFieldExtensionCtx;
}

const replaceVariables = (
    entityPath: string,
    attributes: ItemAttributes,
    locale: string | null,
    id: string
  ) => {
    let path = entityPath ?? '';
    Object.entries(attributes).forEach(([field, value]) => {
      if (path.includes(`$${field}`)) {
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
        path = path.replace(`$${field}`, localizedValue);
      }
    });
    return path.replace("$id",id);
  };

const compareArray = (a: string[] | null, b: string[]) => {
  return a && a.length === b.length && a.every((e,i)=>e === b[i]);
}

export default function PreviewLink({ ctx }: PreviewLinkProps){
    const [fieldData,setFieldData] = useState<{ other: string[]; slug: string; }|null>(JSON.parse(ctx.formValues[ctx.fieldPath] as any ?? null));
    const { siteUrl, previewPath, previewSecret } = ctx.plugin.attributes.parameters as never as Parameters;
    const multiLang = ctx.site.attributes.locales.length > 1;
    const locale = ctx.locale;

    const attributes = useMemo(() => ctx.item?.attributes ?? {}, [ctx.item]);

    const entityPath = useMemo(()=>{
      return fieldData?.slug ?? replaceVariables(ctx.parameters.slug as string,attributes,locale,ctx.item?.id ?? "$id") ?? `/${ctx.itemType.attributes.api_key}`
    },[fieldData]);

    const previewHref = useMemo(() => {
        const noSlashInstanceUrl = siteUrl.replace(/\/$/, '');
    
        return [
          noSlashInstanceUrl,
          previewPath,
          '?slug=',
          multiLang ? `/${locale}` : '',
          entityPath,
          previewSecret ? `&secret=${previewSecret}` : '',
        ].join('');
      }, [
        attributes,
        entityPath,
        locale,
        multiLang,
        previewPath,
        previewSecret,
        siteUrl,
      ]);

    const open = async () => {
      const res = await ctx.openModal({ 
        id: "nextjs-utils-model",
        title: "Edit Settings",
        width: "l",
        parameters: {
          slug: entityPath,
          other: fieldData?.other ?? ctx.parameters?.other ?? []
        }
      }) as { slug: string; other: string[] };

      if(!res) return;

      const data = { slug: replaceVariables(res.slug,attributes,locale, ctx.item?.id ?? "$id"), other: res.other };

      if(data.slug !== fieldData?.slug || !compareArray(fieldData?.other,data.other)) {
        ctx.setFieldValue(ctx.fieldPath,JSON.stringify(data));
        setFieldData(data);
        ctx.notice("Settings Updated");
      }
    }
      
    return (
      <Canvas ctx={ctx}>
          {ctx.itemStatus === 'new' ? (
            'Must save the record at least once'
          ) : (
           <>
            { ctx.parameters?.show_preview ?? true ?  
            <ButtonLink className="mb-4"
              buttonType="primary"
              fullWidth
              href={previewHref}
              target="_blank"
            >View Preview</ButtonLink> : null }

            <Button onClick={open} fullWidth buttonSize="s">Edit Settings</Button>
          </>
          )}
      </Canvas>
    );
}