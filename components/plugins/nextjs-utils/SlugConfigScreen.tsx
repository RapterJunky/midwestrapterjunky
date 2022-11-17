import { RenderManualFieldExtensionConfigScreenCtx } from 'datocms-plugin-sdk';
import { Canvas, Form, TextField, SwitchField } from 'datocms-react-ui';
import { useCallback, useState } from 'react';
import StringListField from '../StringListField';

interface Parameters {
    slug: string;
    others: string[];
    show_preview: boolean;
};

export default function SlugConfigScreen({ ctx }: { ctx: RenderManualFieldExtensionConfigScreenCtx }){
    const errors = ctx.errors as Partial<Record<string, string>>;
    const [formValues, setFormValues] = useState<Partial<Parameters>>(
      ctx.parameters,
    );
  
    const update = useCallback(
      (field: string, value: any) => {
        const newParameters = { ...formValues, [field]: value };
        setFormValues(newParameters);
        ctx.setParameters(newParameters);
      },
      [formValues, ctx],
    );
  
    return (
      <Canvas ctx={ctx}>
        <Form>
          <TextField
            id="slug"
            name="slug"
            label="Entity path"
            required
            value={formValues?.slug ?? `/${ctx.itemType.attributes.api_key}`}
            error={errors.slug}
            onChange={(newValue: string) => update('slug', newValue)}
          />
          <SwitchField value={formValues?.show_preview ?? true} id="show_preview" name="show_preview" label="Show Preview Button" onChange={(value)=>update("show_preview",value) }/>
          <StringListField label="Revaildate Others" onChange={(value: string[])=>update("other",value) }/>
        </Form>
      </Canvas>
    );
  }