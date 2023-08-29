"use client";
import type { Customer } from "square";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Check } from 'lucide-react';
import { useForm } from "react-hook-form";
import useCheckout from "@/hooks/shop/useCheckout";
import type { CheckoutState } from "@/components/providers/CheckoutProvider";
import { signIn, useSession } from "next-auth/react";
import Spinner from "@/components/ui/Spinner";

const AccountTab: React.FC = () => {
    const { state, dispatch } = useCheckout();
    const { data: session, status } = useSession();
    const form = useForm<CheckoutState>({
        defaultValues: state
    });

    const userType = form.watch("userType");

    const onSubmit = async (state: CheckoutState) => {
        if (state.userType === "guest") {
            dispatch({
                event: "FINISH_ACCOUNT_TAB_AS_GUEST", payload: {
                    email: state.email!
                }
            });
            return;
        }

        try {
            const response = await fetch("/api/account/sqaure");
            if (!response.ok) {
                console.error(response);
                form.setError("userType", { message: "Failed to load user account data, Please try again." });
                return;
            }
            const data = await response.json() as Customer | null;

            dispatch({
                event: "FINISH_ACCOUNT_TAB_AS_USER",
                payload: {
                    email: data?.emailAddress ?? session?.user.email as string,
                    accountId: data?.id as string,
                    shipping: data?.address ? {
                        address_line: data?.address?.addressLine1 ?? undefined,
                        address_line2: data?.address?.addressLine2 ?? undefined,
                        city: data?.address?.locality ?? undefined,
                        country: data?.address?.country ?? undefined,
                        postalCode: data?.address?.postalCode ?? undefined,
                        familyName: data?.givenName ?? undefined,
                        state: data.address.administrativeDistrictLevel1 ?? undefined,
                        givenName: data?.givenName ?? undefined,
                        phone: data?.phoneNumber ?? undefined
                    } : null
                }
            });
        } catch (error) {
            console.error(error);

            if (error instanceof Response && error.status === 400) {
                const data = (await error.json().catch((err) => {
                    console.error(err);
                    return null;
                })) as { message: string } | null;

                form.setError("userType", {
                    message: data?.message ?? "An unknown error occurred",
                });
                return;
            }

            form.setError("userType", {
                message: "An unknown error occurred",
            });
        }
    }

    return (
        <>
            <h1 className="text-3xl font-bold">Customer information</h1>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField name="userType" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="my-4 space-y-2">
                                    <FormItem className="flex items-center gap-4 p-2 hover:shadow border border-zinc-300" onClick={() => field.onChange("account")}>
                                        <div>
                                            <h2 className="font-bold">Signin</h2>
                                            <span className="text-zinc-600">
                                                Checkout faster with saved details
                                            </span>
                                        </div>
                                        {field.value === "account" ? (<Check className="ml-auto" />) : null}
                                    </FormItem>
                                    <FormItem onClick={() => field.onChange("guest")} className="flex items-center gap-4 p-2 hover:shadow border border-zinc-300">
                                        <div className="mt-0">
                                            <h2 className="font-bold">Guest Checkout</h2>
                                            <span className="text-zinc-600">
                                                You can create an account later
                                            </span>
                                        </div>
                                        {field.value === "guest" ? (<Check className="ml-auto" />) : null}
                                    </FormItem>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Separator className="my-4" />
                    {userType === "guest" ? (
                        <>
                            <FormField rules={{ required: "A email is required" }} control={form.control} name="email" render={({ field }) => (
                                <FormItem className="mb-4">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input required data-cy="user-recipet-email" type="email" placeholder="me@example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>For recipets & order information only</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full">Continue as guest</Button>
                        </>
                    ) : (
                        <>
                            <Button className="w-full" type="submit" onClick={(ev) => {
                                if (status === "unauthenticated") {
                                    ev.preventDefault();
                                    return signIn();
                                }
                            }} data-cy="checkout-as-user" disabled={form.formState.isSubmitting || status === "loading"}>
                                {form.formState.isSubmitting || status === "loading" ? (<Spinner className="mr-2" />) : null}
                                {status === "unauthenticated" ? ("Register") : (`Continue as ${session?.user.name}`)}
                            </Button>
                        </>
                    )}
                </form>
            </Form>
        </>
    );
}

export default AccountTab;