import type { NextPage } from "next";
import { useDatoCMSPlugin } from "@lib/hooks/plugins/useDatoCms";
import StructuredTextFields from "@lib/plugins/StructuredTextFields";
import { isVaildConfig, normalizeConfig } from '@lib/utils/plugin/types';
import ConfigScreen from "@components/plugins/ConfigScreen";
import ShopFieldExtension from "@components/plugins/ShopFieldExtension";
import BrowseProductsModel from "@components/plugins/BrowseProductsModal";
import CustomImageUpload from "@components/plugins/CustomImagUpload";

import "datocms-react-ui/styles.css";

const FIELD_EXTENSION_ID = 'shopProduct';

const MidwestRaptor: NextPage<any> = () => {
    const {id,page,ctx} = useDatoCMSPlugin({
        renderConfigScreen: true,
        renderFieldExtension: true,
        renderModal: true,
        renderAssetSource: true,
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
        assetSources(ctx) {
            return [
                {
                    id: "optwebp",
                    name: "Optimized Upload",
                    icon: {
                        type: 'svg',
                        viewBox: '0 0 448 512',
                        content: '<path fill="currentColor" d="M448,230.17V480H0V230.17H141.13V355.09H306.87V230.17ZM306.87,32H141.13V156.91H306.87Z" class=""></path>',
                    },
                    modal: {
                        width: "m"
                    }
                }
            ];
        },
    });

    switch (page) {
        case "renderConfigScreen":
            return <ConfigScreen ctx={ctx}/>;
        case "renderFieldExtension":
            return <ShopFieldExtension ctx={ctx}/>;
        case "renderModal":
            if(id === "browseProducts") return <BrowseProductsModel ctx={ctx}/>;
            return null;
        case "renderAssetSource": {
            return <CustomImageUpload ctx={ctx}/>
        }
        default:
            return null;
    }
}

export default MidwestRaptor;