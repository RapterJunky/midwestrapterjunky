import Navbar from "@components/layout/Navbar";

const ScrollOnlyNavbarLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <header>
                {/* @ts-expect-error Async Server Component */}
                <Navbar mode="scroll-only" />
            </header>
            <main className="flex flex-col flex-auto">
                {children}
            </main>
        </>
    );
}

export default ScrollOnlyNavbarLayout;