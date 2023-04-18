export const EDITOR_ISEMPTY_ID_R = "mwj__texteditor::isempty::r";
export const EDITOR_ISEMPTY_ID_S = "mwj__texteditor::isempty::s";
export const EDITOR_RESET_EVENT_ID = "mwj__texteditor::reset";

export const isEditorEmpty = () => {
    return new Promise<boolean>((ok) => {
        const handler = (e: Event) => {
            ok((e as CustomEvent<boolean>).detail);
            window.removeEventListener(EDITOR_ISEMPTY_ID_R, handler);
        }
        window.addEventListener(EDITOR_ISEMPTY_ID_R, handler, false);
        window.dispatchEvent(new CustomEvent(EDITOR_ISEMPTY_ID_S));
    })
}

export const resetEditor = () => window.dispatchEvent(new CustomEvent(EDITOR_RESET_EVENT_ID));
