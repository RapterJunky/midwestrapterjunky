import type { NextPage } from "next";
import { useDatoCMSPlugin } from "../../lib/hooks/plugins/useDatoCms";
import StructuredTextFields from "../../lib/plugins/StructuredTextFields";
import { isVaildConfig, normalizeConfig } from '../../lib/utils/plugin/types';
import ConfigScreen from "../../components/plugins/ConfigScreen";
import ShopFieldExtension from "../../components/plugins/ShopFieldExtension";
import BrowseProductsModel from "../../components/plugins/BrowseProductsModal";

import "datocms-react-ui/styles.css";

const FIELD_EXTENSION_ID = 'shopProduct';

const MidwestRaptor: NextPage<any> = () => {
    const { data } = useDatoCMSPlugin({
        renderConfigScreen: true,
        renderFieldExtension: true,
        renderModal: true,
        async onBoot(ctx) {
            if(!ctx.currentRole.meta.final_permissions.can_edit_schema || isVaildConfig(ctx.plugin.attributes.parameters)) return;
            const fields = await ctx.loadFieldsUsingPlugin();

            const someUpgraded = (
                await Promise.all(fields.map(async field=>{
                    if(field.attributes.appearance.editor !== ctx.plugin.id || field.attributes.appearance.field_extension === FIELD_EXTENSION_ID) return true;

                    await ctx.updateFieldAppearance(field.id,[
                        {
                            operation: "updateEditor",
                            newFieldExtensionId: FIELD_EXTENSION_ID
                        }
                    ]);

                    return true;
                }))
            ).some(x=>x);

            await ctx.updatePluginParameters(normalizeConfig(ctx.plugin.attributes.parameters));

            if(someUpgraded) ctx.notice("Plugin upgraded successfully!");
        },
        overrideFieldExtensions(field, ctx) {
            const config = normalizeConfig(ctx.plugin.attributes.parameters);
            if(!["string","json"].includes(field.attributes.field_type)) return;
            
            if(!config.autoApplyToFieldsWithApiKey || !new RegExp(config.autoApplyToFieldsWithApiKey).test(field.attributes.api_key)) return;
            
            return {
                editor: { id: FIELD_EXTENSION_ID }
            }
        },
        manualFieldExtensions(ctx) {
            return [
                {
                    id: FIELD_EXTENSION_ID,
                    name: 'Shop Products',
                    type: 'editor',
                    fieldTypes: ["json"],
                  }
            ];
        },
        customMarksForStructuredTextField(field, ctx) {
            return StructuredTextFields;
        },
    });

    switch (data.page) {
        case "renderConfigScreen":
            return <ConfigScreen ctx={data.ctx}/>;
        case "renderFieldExtension":
            return <ShopFieldExtension ctx={data.ctx}/>;
        case "renderModal":
            if(data.id === "browseProducts") return <BrowseProductsModel ctx={data.ctx}/>;
            return null;
        default:
            return null;
    }
}

export default MidwestRaptor;