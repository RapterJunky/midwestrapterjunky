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
import dynamic from "next/dynamic";
import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { cn } from "@/lib/utils";

const MailingList = dynamic(() => import("../panels/MailingList"));
const Features = dynamic(() => import("../panels/Features"));
const UserList = dynamic(() => import("../panels/UserList"));
const Threads = dynamic(() => import("../panels/Threads"));
const Reports = dynamic(() => import("../panels/Reports"));
const Topics = dynamic(() => import("../panels/Topics"));

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
      <Tabs
        defaultValue="2"
        className="absolute flex h-full w-full flex-1 overflow-hidden rounded-none"
        orientation="vertical"
      >
        <TabsList
          className={cn(
            "flex h-full w-52 flex-col items-start justify-start rounded-none border-r bg-dato-dark text-dato-light transition",
            { "w-12": mini },
          )}
        >
          <TabsTrigger
            value="0"
            className="flex w-full items-center justify-start gap-2"
          >
            <FaUser /> {mini ? null : "Users List"}
          </TabsTrigger>
          <TabsTrigger
            value="1"
            className="flex w-full items-center justify-start gap-2"
          >
            <FaEnvelope /> {mini ? null : "Mailing List"}
          </TabsTrigger>
          <TabsTrigger
            value="2"
            className="flex w-full items-center justify-start gap-2"
          >
            <FaColumns /> {mini ? null : "Categories"}
          </TabsTrigger>
          <TabsTrigger
            value="3"
            className="flex w-full items-center justify-start gap-2"
          >
            <FaRegCommentDots /> {mini ? null : "Topics"}
          </TabsTrigger>
          <TabsTrigger
            value="4"
            className="flex w-full items-center justify-start gap-2"
          >
            <FaFlag /> {mini ? null : "Reports"}
          </TabsTrigger>
          <TabsTrigger
            value="5"
            className="flex w-full items-center justify-start gap-2"
          >
            <FaKey /> {mini ? null : "Feature Flags"}
          </TabsTrigger>
        </TabsList>
        <UserList mini={mini} setMini={setMini} ctx={ctx} />
        <MailingList mini={mini} setMini={setMini} ctx={ctx} />
        <Threads mini={mini} setMini={setMini} ctx={ctx} />
        <Topics mini={mini} setMini={setMini} ctx={ctx} />
        <Reports mini={mini} setMini={setMini} />
        <Features mini={mini} setMini={setMini} ctx={ctx} />
      </Tabs>
    </Canvas>
  );
};

export default CommunityPage;
