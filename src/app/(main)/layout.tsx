import Footer from "@/components/layout/Footer";

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <header>

            </header>
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
}

export default MainLayout;