import { Tab } from "@headlessui/react";
import AddressForm from "./AddressForm";
import { useForm } from "react-hook-form";
import type { CheckoutFormState } from "@/pages/shop/checkout";
import { HiChevronLeft } from "react-icons/hi";

type Props = {
    next: React.Dispatch<React.SetStateAction<number>>,
    selected: number;
    setGlobalState: React.Dispatch<React.SetStateAction<Partial<CheckoutFormState>>>,
    state: Partial<CheckoutFormState>
}

const ShippingPanel: React.FC<Props> = ({ selected, next, setGlobalState, state }) => {
    const { handleSubmit, register, formState: { errors } } = useForm<CheckoutFormState>({
        defaultValues: state
    });

    const handleShipping = async (state: CheckoutFormState) => {

        setGlobalState((current) => {
            return {
                ...current,
                ready: {
                    shipping: true,
                    user: current.ready?.user ?? false
                },
                shipping_details: state.shipping_details
            }
        });

        next(2);
    }

    return (
        <Tab.Panel>
            <form onSubmit={handleSubmit(handleShipping)}>
                <AddressForm errors={errors} disabled={false} name="shipping" register={register} ids={{
                    name: "shipping_details.name",
                    address1: "shipping_details.address_line1",
                    address2: "shipping_details.address_line2",
                    city: "shipping_details.city",
                    country: "shipping_details.country",
                    phone: "shipping_details.phone",
                    state: "shipping_details.state",
                    postal: "shipping_details.postal",
                    notes: "shipping_details.comments"
                }} />
                <div className="flex justify-between items-center">
                    <button onClick={() => next(0)} type="button" className="flex justify-center items-center text-primary">
                        <HiChevronLeft />
                        <span className="hover:underline">Back</span>
                    </button>
                    <button className="mb-2 text-center block rounded-sm bg-primary px-6 py-4 text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" type="submit">Procced to Payment</button>
                </div>
            </form>
        </Tab.Panel>
    );
}

export default ShippingPanel;