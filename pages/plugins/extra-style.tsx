import Script from "next/script";

interface DatoContext {
    getFieldValue: (path: string) => any;
    connect: (props: { customBlockStylesForStructuredTextField: (field: any, ctx: any)=> any; }) => void; 
}

type AFunction = (plugin: DatoContext)=>void;
interface DatoCmsPluginContext {
    init: (callback: AFunction) => void
}

declare const DatoCmsPlugin: DatoCmsPluginContext;

export default function TestPlugin() {
    return (
        <div>
    
            <Script src="https://unpkg.com/datocms-plugins-sdk" onReady={()=>{
                DatoCmsPlugin.init(plugin=>{
                    plugin.connect({
                        customBlockStylesForStructuredTextField(field, ctx){
                            return [
                                {
                                  id: 'emphasized',
                                  node: 'paragraph',
                                  label: 'Emphasized',
                                  appliedStyle: {
                                    fontFamily: 'Georgia',
                                    fontStyle: 'italic',
                                    fontSize: '1.4em',
                                    lineHeight: '1.2',
                                  }
                                }
                              ];
                        }
                    })
                })
            }}/>
        </div>
    );
}