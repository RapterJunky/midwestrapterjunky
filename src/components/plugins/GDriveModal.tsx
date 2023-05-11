import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas, TextInput } from "datocms-react-ui";

const GDriveModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  return (
    <Canvas ctx={ctx}>
      <form className="flex">
        Search{" "}
        <TextInput
          size={1}
          id="search"
          name="search"
          value=""
          onChange={(e) => {
            console.log(e);
          }}
        />
      </form>
      <div></div>
    </Canvas>
  );
};

export default GDriveModel;
