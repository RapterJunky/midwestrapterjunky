import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useState } from "react";
import { Canvas } from "datocms-react-ui";
import { FaFlag, FaColumns, FaRegTimesCircle } from "react-icons/fa";
import { Tab } from "@headlessui/react";
import { Threads } from "./panels/Threads";
import { Reports } from "./panels/Reports";

const MessageBoardManagerPage: React.FC<{ ctx: RenderPageCtx }> = ({ ctx }) => {
  const [mini, setMini] = useState(false);

  if (!ctx.currentRole.attributes.can_manage_users) {
    return (
      <Canvas ctx={ctx}>
        <div className="absolute flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-dato-xl">
            <FaRegTimesCircle className="h-24 w-24" />
            <h1 className="text-lg">You are not allow to view this page!</h1>
          </div>
        </div>
      </Canvas>
    );
  }

  return (
    <Canvas ctx={ctx}>
      <Tab.Group
        vertical
        as="div"
        className="absolute flex h-full w-full flex-1"
      >
        <Tab.List
          className={`flex flex-col border-r bg-dato-dark text-dato-light transition ${mini ? "w-12" : "w-52"
            }`}
        >
          <Tab className="flex items-center gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaColumns /> {mini ? null : "Categories"}
          </Tab>
          <Tab className="flex items-center justify-start gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaFlag /> {mini ? null : "Reports"}
          </Tab>
        </Tab.List>
        <Tab.Panels className="h-full w-full">
          <Threads mini={mini} setMini={setMini} ctx={ctx} />
          <Reports mini={mini} setMini={setMini} />
        </Tab.Panels>
      </Tab.Group>
    </Canvas>
  );
};

export default MessageBoardManagerPage;
