import type { Metadata, ResolvingMetadata } from "next";

import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckoutTabs from "@/components/pages/shop/checkout/CheckoutTabs";
import ShippingTab from "@/components/pages/shop/checkout/ShippingTab";
import AccountTab from "@/components/pages/shop/checkout/AccountTab";
import BillingTab from "@/components/pages/shop/checkout/BillingTab";
import Calculation from "@/components/pages/shop/checkout/Calculate";
import getGenericSeoTags from "@/lib/helpers/getGenericSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const icons = (await parent).icons;

  return getGenericSeoTags({
    icons,
    robots: false,
    description: "Checkout page for Midest Raptor Junkies.",
    title: "Checkout",
  });
}

const Checkout: React.FC = () => {
  return (
    <div className="flex flex-1 justify-center">
      <div className="container h-full max-w-6xl">
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-3">
          <div className="order-2 col-span-2 flex flex-col p-6 lg:order-none">
            <CheckoutTabs>
              <div className="mb-4 flex justify-center">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="account">
                <AccountTab />
              </TabsContent>
              <TabsContent value="shipping">
                <ShippingTab />
              </TabsContent>
              <TabsContent value="billing">
                <BillingTab />
              </TabsContent>
            </CheckoutTabs>
          </div>
          <Calculation />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
