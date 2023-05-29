import { Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

const LinkDialog: React.FC<{
  state: { url: string; open: boolean; title: string };
  close: (value: string | null) => void;
}> = ({ state, close }) => {
  return (
    <Transition appear show={state.open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => close(null)}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-sm bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="mb-4 text-lg font-medium leading-6 text-gray-900"
                >
                  {state.title}
                </Dialog.Title>
                <form
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const content = new FormData(e.target as HTMLFormElement);
                    const link = content.get("link");

                    if (!link) return;

                    const url = new URL(link.toString());

                    const el = document.getElementById(
                      "link"
                    ) as HTMLInputElement | null;
                    el?.setCustomValidity(
                      url.origin.endsWith(".zip") || url.origin.endsWith(".mov")
                        ? "Link can not be a .zip or a .mov domain."
                        : ""
                    );
                    el?.reportValidity();

                    const vaild = (e.target as HTMLFormElement).checkValidity();
                    if (!vaild) return;

                    close(`${url.origin}${url.pathname}${url.search}`);
                  }}
                >
                  <div className="mb-4 flex flex-col">
                    <label htmlFor="Link">Link</label>
                    <input
                      onChange={(ev) => ev.target.setCustomValidity("")}
                      autoFocus
                      defaultValue={state.url}
                      required
                      placeholder="https://example.com"
                      id="link"
                      name="link"
                      type="url"
                      minLength={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => close(null)}
                      type="button"
                      className="mr-auto inline-block rounded-sm bg-red-600 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#dc4c64] transition duration-150 ease-in-out hover:bg-danger-600 hover:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:bg-danger-600 focus:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:outline-none focus:ring-0 active:bg-danger-700 active:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(220,76,100,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                    >
                      Ok
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LinkDialog;
