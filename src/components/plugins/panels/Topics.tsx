import type { RenderPageCtx } from "datocms-plugin-sdk";

import { Panel } from "./Panel";


export const Topics: React.FC<{
    ctx: RenderPageCtx;
    mini: boolean;
    setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
    return (
        <Panel title="Topics"
            mini={mini}
            setMini={() => setMini((state) => !state)}>

        </Panel>
    );
}