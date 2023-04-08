import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from "next/router";
import { Fragment } from 'react';

type Props = {
    asLoading: boolean,
    type: string;
    message: string;
    isOpen: boolean,
    setIsOpen: (value: boolean) => void
}

const Model: React.FC<Props> = ({ isOpen, setIsOpen, message, type, asLoading }) => {
    const router = useRouter();

    function closeModal() {
        setIsOpen(false)
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => {
                if (asLoading || type === "exit") return;
                closeModal();
            }}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            {asLoading ? (
                                <Dialog.Panel className="w-full max-w-md ">
                                    <div className="flex flex-col items-center justify-center h-36 lg:h-[93px]">
                                        <div
                                            className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                            role="status">
                                            <span
                                                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                                            >Loading...</span>
                                        </div>
                                        <span className="text-xs mt-2 block text-white">Loading payment service.</span>
                                    </div>
                                </Dialog.Panel>
                            ) : (<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-sm bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    Payment error
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={() => {
                                            if (type === "exit") {
                                                return router.replace("/shop/search");
                                            }

                                            closeModal();
                                        }}
                                    >
                                        Ok
                                    </button>
                                </div>
                            </Dialog.Panel>)
                            }
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default Model;