import type { CheckoutState, CheckoutAction } from "@/pages/shop/checkout";
import { signIn, useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { RadioGroup } from "@headlessui/react";
import { HiCheck } from "react-icons/hi";

type Props = {
  next: () => void;
  checkout: [
    CheckoutState,
    React.Dispatch<{ type: CheckoutAction; payload: string | object }>
  ];
  active: boolean;
};

const CustomerInfo: React.FC<Props> = ({
  next,
  checkout: [checkoutState, dispatch],
  active,
}) => {
  const session = useSession();
  const { handleSubmit, register, formState, watch, control } =
    useForm<CheckoutState>({
      defaultValues: checkoutState,
    });

  const user = watch("user");

  const handleRecipets = (state: CheckoutState) => {
    if (state.user === "account") {
      state.email = session.data?.user.email as string | undefined;
    }
    dispatch({ type: "setCompleted", payload: { type: "user", value: true } });
    dispatch({ type: "setUserType", payload: state.user });
    dispatch({ type: "setUserEmail", payload: state.email as string });
    next();
  };

  return (
    <div
      id="tab-1"
      className={`${active ? "flex" : "hidden"} w-full flex-col`}
      aria-labelledby="tab-btn-1"
      role="tabpanel"
      tabIndex={0}
      data-headlessui-state={active ? "selected" : undefined}
    >
      <h1 className="text-3xl font-bold">Customer information</h1>
      <hr className="mb-4 w-full" />
      <form onSubmit={handleSubmit(handleRecipets)} className="flex flex-col">
        <Controller
          control={control}
          rules={{ required: "Please select a option." }}
          name="user"
          render={({ field, fieldState }) => (
            <>
              <RadioGroup
                className="mb-2 flex w-full flex-col gap-2 shadow-sm"
                value={field.value}
                onChange={field.onChange}
              >
                <RadioGroup.Option
                  value="account"
                  className="w-full cursor-pointer border p-2 hover:shadow"
                >
                  {({ checked }) => (
                    <div className="flex w-full items-center gap-4">
                      <div>
                        <h2 className="font-bold">Signin</h2>
                        <span className="text-neutral-600">
                          Checkout faster with saved details
                        </span>
                      </div>

                      {checked ? (
                        <HiCheck className="ml-auto h-10 w-10" />
                      ) : null}
                    </div>
                  )}
                </RadioGroup.Option>
                <RadioGroup.Option
                  value="guest"
                  className="w-full cursor-pointer border p-2 hover:shadow"
                >
                  {({ checked }) => (
                    <div className="flex w-full items-center gap-4">
                      <div>
                        <h2 className="font-bold">Guest Checkout</h2>
                        <span className="text-neutral-600">
                          You can create an account later
                        </span>
                      </div>

                      {checked ? (
                        <HiCheck className="ml-auto h-10 w-10" />
                      ) : null}
                    </div>
                  )}
                </RadioGroup.Option>
              </RadioGroup>
              {fieldState.error ? (
                <span className="text-sm text-red-500">
                  {fieldState.error?.message}
                </span>
              ) : null}
            </>
          )}
        />
        <hr className="my-4" />

        {user === "guest" ? (
          <>
            <div className="flex flex-col">
              <label className="text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                {...register("email", { required: "A email is required." })}
                type="email"
                id="email"
                placeholder="me@example.com"
                className="foucs mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {formState.errors?.email ? (
                <span className="mt-1 text-sm text-red-500">
                  {formState.errors?.email?.message}
                </span>
              ) : null}
            </div>
            <span className="my-2 text-xs text-neutral-600">
              For recipets & order information only
            </span>
            <button
              className="mb-2 block w-full rounded-sm bg-primary px-6 py-4 text-center text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
              type="submit"
            >
              Continue as guest
            </button>
          </>
        ) : session.status === "loading" ? (
          "loading..."
        ) : session.status === "authenticated" ? (
          <button
            className="mb-2 block w-full rounded-sm bg-primary px-6 py-4 text-center text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
            type="submit"
          >
            Continue as {session.data.user.name}
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="mb-2 block w-full rounded-sm bg-primary px-6 py-4 text-center text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
            type="button"
          >
            Register
          </button>
        )}
      </form>
    </div>
  );
};

export default CustomerInfo;
