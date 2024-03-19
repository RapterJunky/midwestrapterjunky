import ShopNavbar from "@/components/pages/shop/ShopNavbar";
import ShoppingCardProvider from "@/components/providers/ShoppingCartProvider";
import { Separator } from "@/components/ui/separator";

const ShopLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ShoppingCardProvider>
      <ShopNavbar />
      <Separator />
      {children}
    </ShoppingCardProvider>
  );
};

export default ShopLayout;
