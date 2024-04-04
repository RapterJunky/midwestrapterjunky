import {
  SidebarLeftArrowIcon,
  Toolbar,
  ToolbarButton,
  ToolbarStack,
  ToolbarTitle,
} from "datocms-react-ui";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { TabsContent } from "@components/ui/tabs";

export const Panel: React.FC<
  React.PropsWithChildren<{
    actions?: React.ReactElement;
    title: string;
    mini: boolean;
    value: string;
    setMini: () => void;
  }>
> = ({ actions = null, title, children, mini, setMini, value }) => {
  return (
    <TabsContent value={value} className="h-full flex-1 flex-col">
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
      <div className="h-full overflow-y-scroll bg-dato-light-bg">
        {children}
      </div>
    </TabsContent>
  );
};
