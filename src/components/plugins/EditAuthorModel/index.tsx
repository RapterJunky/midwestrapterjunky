import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import { useState } from 'react';
import Edit from "./Edit";
import Options from "./Options";
import Select from "./Select";


const EditAuthorModal = ({ ctx }: { ctx: RenderModalCtx }) => {
    const [isEdit, setEdit] = useState(!!Object.keys(ctx.parameters).length);
    const [select, setSelect] = useState(false);

    return (
        <Canvas ctx={ctx}>
            {isEdit ? (
                <Edit ctx={ctx} setEdit={setEdit} />
            ) : select ? (
                <Select ctx={ctx} />
            ) : (
                <Options setEdit={setEdit} setSelect={setSelect} />
            )}
        </Canvas>
    );
}

export default EditAuthorModal;