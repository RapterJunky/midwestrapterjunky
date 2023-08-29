import SquareForm from "@/components/pages/shop/checkout/SquareForm";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Checkout: React.FC = () => {

    return (
        <div className="flex flex-1 justify-center">
            <div className="container h-full max-w-6xl">
                <div className="grid flex-1 grid-cols-1 lg:grid-cols-3">
                    <div className="order-2 col-span-2 flex flex-col p-6 lg:order-none">
                        <Tabs defaultValue="account" className="w-[400px]">
                            <TabsList>
                                <TabsTrigger value="account">Account</TabsTrigger>
                                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                                <TabsTrigger value="billing">Billing</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">Make changes to your account here.</TabsContent>
                            <TabsContent value="shipping">Make changes to your account here.</TabsContent>
                            <TabsContent value="billing">
                                <SquareForm />
                            </TabsContent>
                        </Tabs>
                    </div>
                    <section className="order-1 col-span-1 flex w-full justify-start p-6 lg:order-none">
                        <div className="w-full">
                            <h1 className="text-4xl font-bold">Cart</h1>
                            <Separator />
                            {/** Shopping Cart Itmes */}
                            <Separator />
                            <ul className="pb-2">
                                <li className="flex justify-between py-1">
                                    <span>Subtotal</span>
                                    <span>100</span>
                                </li>
                                <li className="flex justify-between py-1">
                                    <span>Taxes</span>
                                    <span>
                                        Calculating...
                                    </span>
                                </li>
                                <li className="flex justify-between py-1">
                                    <span>Service Charges</span>
                                    <span>
                                        Calculating...
                                    </span>
                                </li>
                            </ul>
                            <div className="border-accent-2 mb-2 flex justify-between border-t py-3">
                                <span>Total</span>
                                <span>
                                    USD{" "}
                                    <span className="font-bold tracking-wide">
                                        Calculating...
                                    </span>
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Checkout;