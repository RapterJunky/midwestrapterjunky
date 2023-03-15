import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useState } from 'react';
import { Canvas, SidebarPanel, Button, Toolbar, ToolbarButton, ToolbarTitle, ToolbarStack, SidebarLeftArrowIcon } from "datocms-react-ui";
import { FaFlag, FaFileAlt, FaColumns, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Tab } from '@headlessui/react';

const Panel: React.FC<React.PropsWithChildren<{ title: string, mini: boolean, setMini: () => void }>> = ({ title, children, mini, setMini }) => {
    return (
        <Tab.Panel className="w-full h-full flex flex-col">
            <Toolbar>
                <ToolbarButton onClick={setMini}>
                    {mini ? (<FaChevronRight />) : (<FaChevronLeft />)}
                </ToolbarButton>
                <ToolbarStack stackSize="l">
                    <ToolbarTitle>{title}</ToolbarTitle>
                    <div className="flex-1" />
                    <Button buttonType="primary">Action</Button>
                </ToolbarStack>
                <ToolbarButton>
                    <SidebarLeftArrowIcon />
                </ToolbarButton>
            </Toolbar>
            <div className="flex h-full justify-center items-center" style={{ background: 'var(--light-bg-color)' }}>
                {children}
            </div>
        </Tab.Panel>
    );
}

const MessageBoardManagerPage: React.FC<{ ctx: RenderPageCtx }> = ({ ctx }) => {
    const [mini, setMini] = useState(false)
    return (
        <Canvas ctx={ctx}>
            <Tab.Group vertical as="div" className="flex flex-1 w-full h-full absolute">
                <Tab.List className="flex flex-col border-r divide-y">
                    <Tab className="p-2 text-left flex items-center gap-1 hover:text-gray-500 ui-selected:text-blue-500">
                        <FaColumns /> {mini ? null : "Threads"}
                    </Tab>
                    <Tab className="p-2 text-left flex items-center gap-1 hover:text-gray-500 ui-selected:text-blue-500">
                        <FaFileAlt /> {mini ? null : ("Posts")}
                    </Tab>
                    <Tab className="p-2 text-left flex items-center gap-1 hover:text-gray-500 ui-selected:text-blue-500">
                        <FaFlag /> {mini ? null : "Reports"}
                    </Tab>
                </Tab.List>
                <Tab.Panels className="w-full h-full">
                    <Panel title="Threads" mini={mini} setMini={() => setMini(state => !state)}>
                        Main Content
                    </Panel>
                    <Panel title="Posts" mini={mini} setMini={() => setMini(state => !state)}>
                        Main Content
                    </Panel>
                    <Panel title="Reports" mini={mini} setMini={() => setMini(state => !state)}>
                        Main Content
                    </Panel>
                </Tab.Panels>
            </Tab.Group>
        </Canvas>
    );
}

export default MessageBoardManagerPage;