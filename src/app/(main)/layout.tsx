import Footer from "@/components/layout/Footer";

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            {children}
            <Footer />
        </>
    );
}

export default MainLayout;