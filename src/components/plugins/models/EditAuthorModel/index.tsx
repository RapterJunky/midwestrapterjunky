import Edit from "./Edit";
import Options from "./Options";
import Select from "./Select";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import { useState } from "react";

const EditAuthorModal = ({ ctx }: { ctx: RenderModalCtx }) => {
  const [pageState, setPageState] = useState<"edit" | "options" | "select">(
    !!Object.keys(ctx.parameters).length ? "edit" : "options",
  );

  return (
    <Canvas ctx={ctx}>
      {pageState === "edit" ? (
        <Edit ctx={ctx} setPageState={(value) => setPageState(value)} />
      ) : pageState === "select" ? (
        <Select ctx={ctx} setPageState={(value) => setPageState(value)} />
      ) : (
        <Options setPageState={(value) => setPageState(value)} />
      )}
    </Canvas>
  );
};

export default EditAuthorModal;
