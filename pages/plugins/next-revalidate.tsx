import { Canvas } from 'datocms-react-ui';
import { useDatocms } from '../../lib/hooks/useDatoCms';
import render from '../../components/plugins/render';

import { type RenderFieldExtensionCtx } from 'datocms-plugin-sdk';

export default function NextRevaildate(){
    const { ctx, loading } = useDatocms({
        manualFieldExtensions(ctx) {
            return [
                {
                    id: "page-slug",
                    name: "NextJs Page Slug",
                    type: "editor",
                    fieldTypes: ["string"],
                    configurable: true,
                    asSidebarPanel: {
                        startOpen: false
                    }
                }
            ];
        },
        renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
            return render(
            <Canvas ctx={ctx}>
                <h1 className='text-bold text-xl'>Path: {ctx.field.attributes.default_value as string}</h1>
            </Canvas>);
        }
    });

    if(!ctx.current) return null;

    return (
        <Canvas ctx={ctx.current}>
            This plugin offers no settings.
        </Canvas>
    );
}