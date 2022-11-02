import { connect, type RenderConfigScreenCtx, FullConnectParameters } from 'datocms-plugin-sdk';
import { useEffect, useRef, useState } from 'react';

export function useDatocms(props?: Partial<FullConnectParameters>){
    const ref = useRef<RenderConfigScreenCtx>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(()=>{
        const init = async () => {
            setLoading(true);

            await connect({
                ...props,
                renderConfigScreen(ctx) {
                    ref.current = ctx;
                },
            });

            setLoading(false);
        }

        init();
        return () => {
            ref.current = undefined;
            setLoading(true);

        }
    },[]);

    return {
        ctx: ref,
        loading
    }
}