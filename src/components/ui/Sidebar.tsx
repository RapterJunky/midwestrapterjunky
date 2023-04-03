import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { Transition } from '@headlessui/react';
import { useEffect, useRef } from 'react';

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
    }
}

type SidebarProps = {
    onClose: () => void;
    side: keyof typeof mode;
}

const Sidebar: React.FC<React.PropsWithChildren<SidebarProps>> = ({ children, onClose, side }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const onKeyDownSidebar = (ev: React.KeyboardEvent<HTMLDivElement>) => {
        if (ev.code === "Escape") onClose();
    }

    useEffect(() => {
        if (sidebarRef.current) sidebarRef.current.focus();

        const contentEl = contentRef.current;

        if (contentEl) disableBodyScroll(contentEl, { reserveScrollBarGap: true });

        return () => {
            clearAllBodyScrollLocks();
        }
    }, []);


    return (
        <Transition enter="transition ease-in-out duration-300 transform"
            enterFrom={mode[side].enterFrom}
            enterTo={mode[side].enterTo}
            appear
            show={true}
            as="div"
            className="fixed inset-0 h-full z-50 box-border outline-none"
            ref={sidebarRef}
            onKeyDown={onKeyDownSidebar}
            tabIndex={1}>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-40 duration-100 ease-linear backdrop-blur-0 backdrop-blur-08" onClick={onClose} />
                <section className={`absolute inset-y-0 w-full md:w-auto max-w-full flex outline-none ${mode[side].side}`}>
                    <div className="h-full w-full md:w-screen md:max-w-md">
                        <div ref={contentRef} className="h-full flex flex-col text-base bg-white shadow-xl overflow-y-auto overflow-x-hidden scrolling-touch">
                            {children}
                        </div>
                    </div>
                </section>
            </div>
        </Transition>
    );
}

export default Sidebar;