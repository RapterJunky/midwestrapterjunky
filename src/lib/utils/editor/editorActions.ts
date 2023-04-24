export const EDITOR_ISEMPTY_ID_R = "mwj::texteditor::isempty::r:";
export const EDITOR_ISEMPTY_ID_S = "mwj::texteditor::isempty::s:";
export const EDITOR_RESET_EVENT_ID = "mwj::texteditor::reset:";

export const isEditorEmpty = (id: string) => {
    return new Promise<boolean>((ok) => {
        const handler = (e: Event) => {
            ok((e as CustomEvent<boolean>).detail);
            window.removeEventListener(`${EDITOR_ISEMPTY_ID_R}${id}`, handler);
        }
        window.addEventListener(`${EDITOR_ISEMPTY_ID_R}${id}`, handler, false);
        window.dispatchEvent(new CustomEvent(`${EDITOR_ISEMPTY_ID_S}${id}`));
    })
}

export const resetEditor = (id: string) => window.dispatchEvent(new CustomEvent(`${EDITOR_RESET_EVENT_ID}${id}`));
