import Footer from "@/components/layout/Footer";

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-full flex-col">
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
