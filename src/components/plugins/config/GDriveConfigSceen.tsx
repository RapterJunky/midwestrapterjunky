import type { RenderManualFieldExtensionConfigScreenCtx } from "datocms-plugin-sdk";
import { Canvas, Form, TextField, SwitchField } from "datocms-react-ui";
import { useState, useCallback, useMemo } from "react";

type Parameters = {
  minAssets: number;
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
          <>
            <div className="mb-dato-m">
              <TextField
                error={errors.minAssets}
                id="minAssets"
                name="minAssets"
                hint="The minimum amount of assets that are needed to be selected"
                label="Min Assets"
                required
                textInputProps={{
                  min: 1,
                  type: "number",
                }}
                value={formValues.minAssets}
                onChange={(ev) => update("minAssets", parseInt(ev))}
              />
            </div>
            <TextField
              error={errors.maxAssets}
              id="maxAssets"
              name="maxAssets"
              hint="The maximum amount of assets that can be selected"
              label="Max Assets"
              required
              textInputProps={{
                min: 1,
                type: "number",
              }}
              value={formValues.maxAssets}
              onChange={(ev) => update("maxAssets", parseInt(ev))}
            />
          </>
        ) : null}
      </Form>
    </Canvas>
  );
};

export default GDriveConfigScreen;
