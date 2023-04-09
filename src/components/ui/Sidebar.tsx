import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import { Transition } from "@headlessui/react";
import { useEffect, useRef } from "react";

const mode = {
  left: {
    side: "left-0 md:pr-10",
    enterFrom: "-translate-x-full",
    enterTo: "translate-x-0",
  },
  right: {
    side: "right-0 md:pl-10",
    enterFrom: "translate-x-full",
    enterTo: "-translate-x-0",
  },
};

type SidebarProps = {
  onClose: () => void;
  side: keyof typeof mode;
};

const Sidebar: React.FC<React.PropsWithChildren<SidebarProps>> = ({
  children,
  onClose,
  side,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const onKeyDownSidebar = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.code === "Escape") onClose();
  };

  useEffect(() => {
    if (sidebarRef.current) sidebarRef.current.focus();

    const contentEl = contentRef.current;

    if (contentEl) disableBodyScroll(contentEl, { reserveScrollBarGap: true });

    return () => {
      clearAllBodyScrollLocks();
    };
  }, []);

  return (
    <Transition
      enter="transition ease-in-out duration-300 transform"
      enterFrom={mode[side].enterFrom}
      enterTo={mode[side].enterTo}
      appear
      show={true}
      as="div"
      className="fixed inset-0 z-50 box-border h-full outline-none"
      ref={sidebarRef}
      onKeyDown={onKeyDownSidebar}
      tabIndex={1}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="backdrop-blur-08 absolute inset-0 bg-black bg-opacity-40 backdrop-blur-0 duration-100 ease-linear"
          onClick={onClose}
        />
        <section
          className={`absolute inset-y-0 flex w-full max-w-full outline-none md:w-auto ${mode[side].side}`}
        >
          <div className="h-full w-full md:w-screen md:max-w-md">
            <div
              ref={contentRef}
              className="scrolling-touch flex h-full flex-col overflow-y-auto overflow-x-hidden bg-white text-base shadow-xl"
            >
              {children}
            </div>
          </div>
        </section>
      </div>
    </Transition>
  );
};

export default Sidebar;
