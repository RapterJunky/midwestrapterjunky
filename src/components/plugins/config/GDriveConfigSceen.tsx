import type { RenderManualFieldExtensionConfigScreenCtx } from "datocms-plugin-sdk";
import { Canvas, Form, TextField, SwitchField } from "datocms-react-ui";
import { useState, useCallback, useMemo } from "react";

type Parameters = {
  maxAssets: number;
  limitAssets: boolean;
};

const GDriveConfigScreen: React.FC<{
  ctx: RenderManualFieldExtensionConfigScreenCtx;
}> = ({ ctx }) => {
  const errors = ctx.errors as Partial<Record<keyof Parameters, string>>;
  const [formValues, setFormValues] = useState<Partial<Parameters>>(
    ctx.parameters
  );
  const setParameters = useMemo(() => ctx.setParameters, [ctx.setParameters]);

  const update = useCallback(
    (field: string, value: unknown) => {
      const newParameters = { ...formValues, [field]: value };
      setFormValues(newParameters);
      setParameters(newParameters).catch((e) => console.error(e));
    },
    [formValues, setFormValues, setParameters]
  );

  return (
    <Canvas ctx={ctx}>
      <Form>
        <SwitchField
          error={errors.limitAssets}
          onChange={update.bind(null, "limitAssets")}
          value={formValues.limitAssets ?? false}
          name="limitAssets"
          id="limitAssets"
          label="Limit Assets"
        />

        {formValues?.limitAssets ?? false ? (
          <TextField
            error={errors.maxAssets}
            id="maxAssets"
            name="maxAssets"
            label="Max Assets"
            required
            textInputProps={{
              min: 1,
              type: "number",
            }}
            value={formValues.maxAssets}
            onChange={update.bind(null, "maxAssets")}
          />
        ) : null}
      </Form>
    </Canvas>
  );
};

export default GDriveConfigScreen;
