/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  OnBootCtx,
  IntentCtx,
  MainNavigationTab,
  SettingsAreaSidebarItemGroup,
  ContentAreaSidebarItem,
  ManualFieldExtension,
  AssetSource,
  ItemType,
  ItemFormSidebarPanel,
  ItemFormOutlet,
  Field,
  FieldExtensionOverride,
  FieldIntentCtx,
  StructuredTextCustomMark,
  StructuredTextCustomBlockStyle,
  FullConnectParameters,
  RenderFieldExtensionCtx,
  RenderPageCtx,
  RenderModalCtx,
  RenderConfigScreenCtx,
  RenderItemFormOutletCtx,
  RenderAssetSourceCtx,
  RenderItemFormSidebarPanelCtx,
  RenderManualFieldExtensionConfigScreenCtx,
} from "datocms-plugin-sdk";

export type Context =
  | RenderFieldExtensionCtx
  | RenderPageCtx
  | RenderModalCtx
  | RenderConfigScreenCtx
  | RenderItemFormOutletCtx
  | RenderAssetSourceCtx
  | RenderItemFormSidebarPanelCtx
  | RenderManualFieldExtensionConfigScreenCtx
  | undefined;

export type RenderPage =
  | "ItemFormOutlet"
  | "AssetSource"
  | "ItemFormSidebarPanel"
  | "Modal"
  | "ConfigScreen"
  | "ManualFieldExtensionConfigScreen"
  | "FieldExtension"
  | "Page"
  | "none";

type Params = Omit<
  FullConnectParameters,
  | "renderManualFieldExtensionConfigScreen"
  | "renderItemFormSidebarPanel"
  | "renderItemFormOutlet"
  | "renderModal"
  | "renderConfigScreen"
  | "renderPage"
  | "renderAssetSource"
  | "renderFieldExtension"
>;

interface PluginOverride {
  /**
   * Should this function will be called when the plugin needs to render the plugin's
   * configuration form
   *
   * @tag configScreen
   */
  renderConfigScreen: boolean;
  /**
   * Should this function will be called when the plugin needs to render a specific
   * page (see the `mainNavigationTabs`, `settingsAreaSidebarItemGroups` and
   * `contentAreaSidebarItems` functions)
   *
   * @tag pages
   */
  renderPage: boolean;
  /**
   * Should this function will be called when the plugin requested to open a modal (see
   * the `openModal` function)
   *
   * @tag modals
   */
  renderModal: boolean;
  /**
   * Should this function will be called when the plugin needs to render a sidebar
   * panel (see the `itemFormSidebarPanels` function)
   *
   * @tag sidebarPanels
   */
  renderItemFormSidebarPanel: boolean;
  /**
   * Should this  function will be called when the plugin needs to render an outlet (see
   * the `itemFormOutlets` function)
   *
   * @tag itemFormOutlets
   */
  renderItemFormOutlet: boolean;
  /**
   * Should this  function will be called when the user selects one of the plugin's
   * asset sources to upload a new media file.
   *
   * @tag assetSources
   */
  renderAssetSource: boolean;
  /**
   * Should this  function will be called when the plugin needs to render a field
   * extension (see the `manualFieldExtensions` and `overrideFieldExtensions`
   * functions)
   *
   * @tag forcedFieldExtensions
   */
  renderFieldExtension: boolean;
  /**
   * Should this function will be called when the plugin needs to render the
   * configuration form for installing a field extension inside a particular
   * field
   *
   * @tag manualFieldExtensions
   */
  renderManualFieldExtensionConfigScreen: boolean;
}

export type PluginSettings = Params & PluginOverride;
