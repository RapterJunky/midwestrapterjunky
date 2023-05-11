import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import { FaGoogleDrive } from "react-icons/fa";

const GDriveAddon: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({ ctx }) => {
  return (
    <Canvas ctx={ctx}>
      <Button
        onClick={() =>
          ctx.openModal({
            id: "gDriveModel",
            title: "Choose from Google Drive",
            width: "xl",
          })
        }
        leftIcon={<FaGoogleDrive />}
        buttonSize="s"
      >
        From Google Drive
      </Button>
    </Canvas>
  );
};

export default GDriveAddon;
