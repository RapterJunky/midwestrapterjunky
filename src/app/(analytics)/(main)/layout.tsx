import Footer from "@/components/layout/Footer";
import ExitPreview from "@/components/ui/ExitPreview";
import { draftMode } from 'next/headers';

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isEnabled } = draftMode();

  return (
    <div className="flex min-h-full flex-col">
      {children}
      <Footer />
      {isEnabled ? (<ExitPreview />) : null}
    </div>
  );
};

export default MainLayout;
