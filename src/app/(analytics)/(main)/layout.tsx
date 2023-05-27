import Footer from "@/components/layout/Footer";

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-full">
            {children}
            <Footer />
        </div>
    );
}

export default MainLayout;