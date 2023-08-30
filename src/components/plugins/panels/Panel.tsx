import { Tab } from "@headlessui/react";
import {
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  ToolbarStack,
  SidebarLeftArrowIcon,
} from "datocms-react-ui";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export const Panel: React.FC<
  React.PropsWithChildren<{
    actions?: React.ReactElement;
    title: string;
    mini: boolean;
    setMini: () => void;
  }>
> = ({ actions = null, title, children, mini, setMini }) => {
  return (
    <Tab.Panel className="flex h-full flex-1 flex-col">
      <Toolbar>
        <ToolbarButton onClick={setMini}>
          {mini ? <FaChevronRight /> : <FaChevronLeft />}
        </ToolbarButton>
        <ToolbarStack stackSize="l">
          <ToolbarTitle>{title}</ToolbarTitle>
          <div className="flex-1" />
          {actions}
        </ToolbarStack>
        <ToolbarButton>
          <SidebarLeftArrowIcon />
        </ToolbarButton>
      </Toolbar>
      <div className="h-full overflow-y-scroll bg-dato-light">{children}</div>
    </Tab.Panel>
  );
};
