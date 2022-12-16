import { 
    connect, 
    type OnBootCtx, 
    type IntentCtx,
    type MainNavigationTab,
    type SettingsAreaSidebarItemGroup,
    type ContentAreaSidebarItem,
    type ManualFieldExtension,
    type AssetSource,
    type ItemType,
    type ItemFormSidebarPanel,
    type ItemFormOutlet,
    type Field,
    type FieldExtensionOverride,
    type FieldIntentCtx,
    type StructuredTextCustomMark,
    type StructuredTextCustomBlockStyle
} from 'datocms-plugin-sdk';
import { useEffect, useState, useRef } from 'react';


type RenderPage = "renderItemFormOutlet"|"renderAssetSource"|"renderItemFormSidebarPanel"|"renderModal"|"renderConfigScreen"|"renderManualFieldExtensionConfigScreen"|"renderFieldExtension"|"renderPage"|"none";

interface PluginSettings {
    /**
     * This function will be called once at boot time and can be used to perform
     * ie. some initial integrity checks on the configuration.
     *
     * @tag boot
     */
    onBoot: (ctx: OnBootCtx) => void;
     /**
     * Use this function to declare new tabs you want to add in the top-bar of the
     * UI
     *
     * @tag pages
     */
    mainNavigationTabs: (ctx: IntentCtx) => MainNavigationTab[];
     /**
     * Use this function to declare new navigation sections in the Settings Area
     * sidebar
     *
     * @tag pages
     */
    settingsAreaSidebarItemGroups: (ctx: IntentCtx) => SettingsAreaSidebarItemGroup[];
    /**
     * Use this function to declare new navigation items in the Content Area
     * sidebar
     *
     * @tag pages
     */
    contentAreaSidebarItems: (ctx: IntentCtx) => ContentAreaSidebarItem[];
    /**
     * Use this function to declare new field extensions that users will be able
     * to install manually in some field
     *
     * @tag manualFieldExtensions
     */
    manualFieldExtensions: (ctx: IntentCtx) => ManualFieldExtension[];
     /**
     * Use this function to declare additional sources to be shown when users want
     * to upload new assets
     *
     * @tag assetSources
     */
    assetSources: (ctx: IntentCtx) => AssetSource[] | void;
    /**
     * Use this function to declare new sidebar panels to be shown when the user
     * edits records of a particular model
     *
     * @tag sidebarPanels
     */
    itemFormSidebarPanels: (itemType: ItemType, ctx: IntentCtx) => ItemFormSidebarPanel[];
    /**
     * Use this function to declare custom outlets to be shown at the top of the
     * record's editing page
     *
     * @tag itemFormOutlets
     */
    itemFormOutlets: (itemType: ItemType, ctx: IntentCtx) => ItemFormOutlet[];
    /**
     * Use this function to automatically force one or more field extensions to a
     * particular field
     *
     * @tag forcedFieldExtensions
     */
    overrideFieldExtensions: (field: Field, ctx: FieldIntentCtx) => FieldExtensionOverride | void;
    /**
     * Use this function to define a number of custom marks for a specific
     * Structured Text field
     *
     * @tag structuredText
     */
    customMarksForStructuredTextField: (field: Field, ctx: FieldIntentCtx) => StructuredTextCustomMark[] | void;
    /**
     * Use this function to define a number of custom block styles for a specific
     * Structured Text field
     *
     * @tag structuredText
     */
    customBlockStylesForStructuredTextField: (field: Field, ctx: FieldIntentCtx) => StructuredTextCustomBlockStyle[] | void;
    /**
     * This function will be called when the plugin needs to render the plugin's
     * configuration form
     *
     * @tag configScreen
     */
    renderConfigScreen: boolean
    /**
     * This function will be called when the plugin needs to render a specific
     * page (see the `mainNavigationTabs`, `settingsAreaSidebarItemGroups` and
     * `contentAreaSidebarItems` functions)
     *
     * @tag pages
     */
    renderPage: boolean;
     /**
     * This function will be called when the plugin requested to open a modal (see
     * the `openModal` function)
     *
     * @tag modals
     */
    renderModal: boolean;
    /**
     * This function will be called when the plugin needs to render a sidebar
     * panel (see the `itemFormSidebarPanels` function)
     *
     * @tag sidebarPanels
     */
     renderItemFormSidebarPanel: boolean;
    /**
     * This function will be called when the plugin needs to render an outlet (see
     * the `itemFormOutlets` function)
     *
     * @tag itemFormOutlets
    */
    renderItemFormOutlet: boolean;
    /**
     * This function will be called when the user selects one of the plugin's
     * asset sources to upload a new media file.
     *
     * @tag assetSources
     */
    renderAssetSource: boolean;
    /**
     * This function will be called when the plugin needs to render a field
     * extension (see the `manualFieldExtensions` and `overrideFieldExtensions`
     * functions)
     *
     * @tag forcedFieldExtensions
     */
    renderFieldExtension: boolean;
    /**
     * This function will be called when the plugin needs to render the
     * configuration form for installing a field extension inside a particular
     * field
     *
     * @tag manualFieldExtensions
     */
    renderManualFieldExtensionConfigScreen: boolean;
    /**
     * This function will be called each time the configuration object changes. It
     * must return an object containing possible validation errors
     *
     * @tag manualFieldExtensions
    */
    validateManualFieldExtensionParameters: (fieldExtensionId: string, parameters: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>>;
}

interface PluginState {
    page: RenderPage, 
    ctx: any
    id?: string;
}

export function useDatoCMSPlugin(props: Partial<PluginSettings>){
    const pluginLoaded = useRef<boolean>(false);
    const [ data, setData ] = useState<PluginState>({ page: "none", ctx: undefined });


    useEffect(()=>{
        const init = async () => {
            const { 
                renderConfigScreen, 
                renderPage, 
                renderModal, 
                renderItemFormSidebarPanel, 
                renderAssetSource, 
                renderFieldExtension, 
                renderItemFormOutlet, 
                renderManualFieldExtensionConfigScreen, 
                ...other } = props;

            await connect({
                renderConfigScreen: renderConfigScreen ? (ctx) => {
                    if(data.page === "renderConfigScreen") return;
                    setData({ page: "renderConfigScreen", ctx  });
                } : undefined,
                renderPage: renderPage ? (pageId, ctx) => {
                    if(data.page === "renderPage" && data?.id === pageId) return;
                    setData({ page: "renderPage", ctx, id: pageId });
                }: undefined,
                renderModal: renderModal ? (modalId, ctx) => {
                    if(data.page === "renderModal" && data?.id === modalId) return;
                    setData({ page: "renderModal", id: modalId, ctx });
                } : undefined,
                renderItemFormSidebarPanel: renderItemFormSidebarPanel ? (sidebarPaneId, ctx) => {
                    if(data.page === "renderItemFormSidebarPanel" && data?.id === sidebarPaneId) return;
                    setData({ page: "renderItemFormSidebarPanel", ctx, id: sidebarPaneId });
                } : undefined,
                renderItemFormOutlet: renderItemFormOutlet ? (itemFormOutletId, ctx) => {
                    if(data.page === "renderItemFormOutlet" && data?.id === itemFormOutletId) return;
                    setData({ page: "renderItemFormOutlet", ctx, id: itemFormOutletId });
                } : undefined,
                renderAssetSource: renderAssetSource ? (assetSourceId, ctx) => {
                  if(data.page === "renderAssetSource" && data?.id === assetSourceId) return;
                  setData({ page: "renderAssetSource", ctx, id: assetSourceId }); 
                } : undefined,
                renderFieldExtension: renderFieldExtension ? (fieldExtensionId, ctx) => {
                    if(data.page === "renderFieldExtension" && data?.id === fieldExtensionId) return;
                    setData({ page: "renderFieldExtension", ctx, id: fieldExtensionId });
                } : undefined,
                renderManualFieldExtensionConfigScreen: renderManualFieldExtensionConfigScreen ? (fieldExtensionId, ctx) => {
                    if(data.page === "renderManualFieldExtensionConfigScreen" && data?.id === fieldExtensionId) return;
                    setData({ page: "renderManualFieldExtensionConfigScreen", ctx, id: fieldExtensionId });
                } : undefined,
                ...other
            });

            pluginLoaded.current = true;
        }
        if(!pluginLoaded.current) init();
    },[]);

    return data;
}