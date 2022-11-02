import { Canvas } from 'datocms-react-ui';
import { useDatocms } from '../../lib/hooks/useDatoCms';

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
    });

    if(loading || !ctx.current ) return null;

    return (
        <Canvas ctx={ctx.current}>
            Next Revaildate Page Plugin
        </Canvas>
    );
}