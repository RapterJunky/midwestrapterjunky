import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useState } from "react";
import {
  Canvas,
} from "datocms-react-ui";
import {
  FaFlag,
  FaColumns,
} from "react-icons/fa";
import { Tab } from "@headlessui/react";
import { Threads } from "./panels/Threads";
import { Reports } from "./panels/Reports";

const MessageBoardManagerPage: React.FC<{ ctx: RenderPageCtx }> = ({ ctx }) => {
  const [mini, setMini] = useState(false);
  return (
    <Canvas ctx={ctx}>
      <Tab.Group
        vertical
        as="div"
        className="absolute flex h-full w-full flex-1"
      >
        <Tab.List className={`flex flex-col divide-y border-r bg-dato-dark text-dato-light transition ${mini ? "w-12" : "w-52"}`}>
          <Tab className="flex items-center gap-1 px-4 py-2 text-left hover:text-gray-300 ui-selected:text-dato-primary outline-none">
            <FaColumns /> {mini ? null : "Threads"}
          </Tab>
          <Tab className="flex items-center justify-start gap-1 px-4 py-2 text-left hover:text-gray-300 ui-selected:text-dato-primary outline-none">
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
