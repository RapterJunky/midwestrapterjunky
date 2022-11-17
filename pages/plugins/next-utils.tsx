import { useDatoCMSPlugin } from '../../lib/hooks/useDatoCms';
import PreviewLink from '../../components/plugins/nextjs-utils/PreviewLink';
import ConfigScreen from '../../components/plugins/nextjs-utils/ConfigScreen';

import 'datocms-react-ui/styles.css';
import CustomModel from '../../components/plugins/nextjs-utils/CustomModel';
import SlugConfigScreen from '../../components/plugins/nextjs-utils/SlugConfigScreen';

export default function NextRevaildate(){
    const { data } = useDatoCMSPlugin({
        renderConfigScreen: true,
        renderFieldExtension: true,
        renderModal: true,
        renderManualFieldExtensionConfigScreen: true,
        manualFieldExtensions(ctx) {
            return [
                {
                    id: "nextjs-utils",
                    name: "NextJs Utils",
                    type: "editor",
                    fieldTypes: ["json"],
                    configurable: true,
                    asSidebarPanel: {
                        startOpen: false
                    }
                }
            ];
        },
        validateManualFieldExtensionParameters(
            _fieldExtensionId: string,
            parameters: Record<string, any>,
          ) {
            const errors: Record<string, string> = {};
            if (!parameters.slug) {
              errors.slug = 'Please provide an entity path';
            }
            return errors;
          }
    });

    switch(data.page){
        case "renderManualFieldExtensionConfigScreen":
            return <SlugConfigScreen ctx={data.ctx}/>
        case "renderConfigScreen": 
            return <ConfigScreen ctx={data.ctx}/>;
        case "renderFieldExtension":
            return <PreviewLink ctx={data.ctx}/>;
        case "renderModal":
            if(data.id === "nextjs-utils-model") return <CustomModel ctx={data.ctx}/>;
            return null;
        default: 
            return null;
    }
}