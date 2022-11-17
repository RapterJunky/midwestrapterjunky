import type { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import { Canvas, TextField, Form, FieldGroup, Button } from 'datocms-react-ui';
import { Controller, useForm } from 'react-hook-form';

interface ConfigScreenProps {
    ctx: RenderConfigScreenCtx
}

export interface Parameters {
    siteUrl: string;
    previewPath: string;
    previewSecret?: string;
};


const getDefaultState = (params: Partial<Parameters>): Parameters => ({
    siteUrl: params.siteUrl || '',
    previewPath: params.previewPath || '',
    previewSecret: params.previewSecret || '',
  });

export default function ConfigScreen({ ctx }: ConfigScreenProps){
    const parameters = ctx.plugin.attributes.parameters as never as Parameters;

    const { handleSubmit, control } = useForm<Parameters>({
        defaultValues: getDefaultState(parameters),
    });

    const savePluginSettings = async (values: Parameters) => {
      await ctx.updatePluginParameters(values as any);
      ctx.notice('Settings updated successfully!');
    };  

    return (
        <Canvas ctx={ctx}>
          <Form onSubmit={handleSubmit(savePluginSettings)}>
            <FieldGroup>
              <Controller
                control={control}
                name="siteUrl"
                rules={{ required: 'Site url is required' }}
                render={({ field: { ref: inputRef, ...field }, fieldState }) => {
                  return (
                    <TextField
                      {...field}
                      required
                      placeholder="https://google.com"
                      error={fieldState.error?.message}
                      id="siteUrl"
                      label="Site URL"
                      hint="The url of your Next.js site deployment"
                    />
                  );
                }}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                control={control}
                name="previewPath"
                rules={{ required: 'Preview path is required' }}
                render={({ field: { ref: inputRef, ...field }, fieldState }) => {
                  return (
                    <TextField
                      {...field}
                      required
                      placeholder="/api/preview"
                      error={fieldState.error?.message}
                      id="previewPath"
                      label="Preview API path"
                      hint="Next.js API path to link to to enable previews"
                    />
                  );
                }}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                control={control}
                name="previewSecret"
                render={({ field: { ref: inputRef, ...field }, fieldState }) => {
                  return (
                    <TextField
                      {...field}
                      placeholder="API preview secret"
                      error={fieldState.error?.message}
                      id="previewSecret"
                      label="Preview secret"
                      hint="Secret to append to preview link query parameter, leave blank if none is needed"
                    />
                  );
                }}
              />
            </FieldGroup>
    
            <Button buttonSize="l" buttonType="primary" type="submit">
              Save settings
            </Button>
          </Form>
        </Canvas>
      );
}