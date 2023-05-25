import {
  FaFlag,
  FaColumns,
  FaRegTimesCircle,
  FaEnvelope,
  FaRegCommentDots,
  FaKey,
  FaUser,
} from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import { useState } from "react";

import { Tab } from "@headlessui/react";
import { Threads } from "../panels/Threads";
import { Reports } from "../panels/Reports";
import { MailingList } from "../panels/MailingList";
import { Topics } from "../panels/Topics";
import { Features } from "../panels/Features";
import { UserList } from "../panels/UserList";

const CommunityPage: React.FC<{ ctx: RenderPageCtx }> = ({ ctx }) => {
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
        defaultValue={2}
        vertical
        as="div"
        className="absolute flex h-full w-full flex-1"
      >
        <Tab.List
          className={`flex flex-col border-r bg-dato-dark text-dato-light transition ${mini ? "w-12" : "w-52"
            }`}
        >
          <Tab className="flex items-center justify-start gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaUser /> {mini ? null : "Users List"}
          </Tab>
          <Tab className="flex items-center justify-start gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaEnvelope /> {mini ? null : "Mailing List"}
          </Tab>
          <Tab className="flex items-center gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaColumns /> {mini ? null : "Categories"}
          </Tab>
          <Tab className="flex items-center justify-start gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaRegCommentDots /> {mini ? null : "Topics"}
          </Tab>
          <Tab className="flex items-center justify-start gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaFlag /> {mini ? null : "Reports"}
          </Tab>
          <Tab className="flex items-center justify-start gap-1 px-4 py-2 text-left outline-none hover:text-gray-300 ui-selected:bg-gray-400 ui-selected:bg-opacity-20">
            <FaKey /> {mini ? null : "Feature Flags"}
          </Tab>
        </Tab.List>
        <Tab.Panels className="h-full w-full">
          <UserList mini={mini} setMini={setMini} ctx={ctx} />
          <MailingList mini={mini} setMini={setMini} ctx={ctx} />
          <Threads mini={mini} setMini={setMini} ctx={ctx} />
          <Topics mini={mini} setMini={setMini} ctx={ctx} />
          <Reports mini={mini} setMini={setMini} />
          <Features mini={mini} setMini={setMini} ctx={ctx} />
        </Tab.Panels>
      </Tab.Group>
    </Canvas>
  );
};

export default CommunityPage;
