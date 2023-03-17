import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface DialogProps {
  onClose: () => void;
  show: boolean;
  title: string;
  reportHandle: (state: FormData) => Promise<void>;
}

const ReportDialog: React.FC<DialogProps> = ({
  onClose,
  reportHandle,
  show,
  title,
}) => {
  return (
    <Transition as={Fragment} show={show}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        <Transition.Child>
          <div className="fixed inset-0 flex items-center justify-center p-4 shadow">
            <Dialog.Panel className="w-full max-w-sm rounded-sm bg-white">
              <Dialog.Title className="border-b p-2 text-lg font-medium">
                {title}
              </Dialog.Title>
              <form
                className="my-4 flex flex-col justify-center px-4"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  reportHandle(new FormData(ev.target as HTMLFormElement));
                }}
              >
                <label className="block">
                  <span className="text-gray-700">Reason for reporting</span>
                  <input
                    autoComplete="off"
                    name="reason"
                    className="mt-0 block w-full border-0 border-b-2 border-gray-200 px-0.5 focus:border-black focus:ring-0"
                    type="text"
                    placeholder="reason"
                  />
                </label>
                <div className="mt-4 flex justify-between">
                  <button
                    className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                    type="button"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default ReportDialog;
