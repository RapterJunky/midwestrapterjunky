import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Panel } from "./Panel";

export const MailingList: React.FC<{
    ctx: RenderPageCtx;
    mini: boolean;
    setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
    return (
        <Panel title="Mailing List"
            mini={mini}
            setMini={() => setMini((state) => !state)}>

        </Panel>
    );
}