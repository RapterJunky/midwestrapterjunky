import type {
  RenderConfigScreenCtx,
  RenderFieldExtensionCtx,
  RenderPageCtx,
  RenderModalCtx,
  MainNavigationTab,
  RenderAssetSourceCtx,
} from "datocms-plugin-sdk";
import type { NextPage } from "next";
import dynamic from "next/dynamic";

import { useDatoCMS } from "@hook/plugins/useDatoCms";
import StructuredTextFields from "@/lib/plugin/StructuredTextFields";
import { isVaildConfig, normalizeConfig } from "@/lib/utils/plugin/config";
import { hasFlag } from "@lib/config/hasFlag";
import { Flags } from "@lib/config/flags";

import "datocms-react-ui/styles.css";

const FIELD_EXTENSION_ID_PREVIEW = "mrj_preview_link";
const FIELD_ADDON_ID_DOCX = "mrj_docx_import";
const FIELD_EXTENSION_ID = "shopProduct";
const FIELD_EXTENSION_ID_AUTHOR = "RJ_AUTHOR_EDITOR";
const MESSAGE_BOARD_PAGE_ID = "message-board-manager";

const ConfigScreen = dynamic(() => import("@components/plugins/ConfigScreen"));
const ShopFieldExtension = dynamic(
  () => import("@components/plugins/ShopFieldExtension")
);
const AuthorEditorExtension = dynamic(
  () => import("@components/plugins/AuthorEditorExtension")
);

const AssetSourceOptimized = dynamic(
  () => import("@components/plugins/AssetSourceOptimized")
);

const EditAuthorModal = dynamic(
  () => import("@components/plugins/EditAuthorModel")
);
const StorefrontModel = dynamic(
  () => import("@components/plugins/StorefrontModel")
);
const BrowseProductsModel = dynamic(
  () => import("@components/plugins/BrowseProductsModal")
);
const MessageBoardManagerPage = dynamic(
  () => import("@components/plugins/MessageBoardManagerPage")
);
const EditThreadModel = dynamic(
  () => import("@components/plugins/EditThreadModel")
);

const DocxImportFieldAddon = dynamic(
  () => import("@components/plugins/DocxImportFieldAddon")
);

const PreviewLinkExtension = dynamic(
  () => import("@components/plugins/PreviewLinkExtension")
);

const MidwestRaptor: NextPage = () => {
  const { id, page, ctx } = useDatoCMS({
    renderConfigScreen: true,
    renderFieldExtension: true,
    renderPage: true,
    renderModal: true,
    renderAssetSource: true,
    async onBoot(ctx) {
      if (
        !ctx.currentRole.meta.final_permissions.can_edit_schema ||
        isVaildConfig(ctx.plugin.attributes.parameters)
      )
        return;
      const fields = await ctx.loadFieldsUsingPlugin();

      const someUpgraded = (
        await Promise.all(
          fields.map(async (field) => {
            if (
              field.attributes.appearance.editor !== ctx.plugin.id ||
              [FIELD_EXTENSION_ID, FIELD_EXTENSION_ID_AUTHOR].includes(
                field.attributes.appearance.field_extension ?? ""
              )
            )
              return true;

            if (
              field.attributes.appearance.field_extension ===
              FIELD_EXTENSION_ID_AUTHOR
            ) {
              await ctx.updateFieldAppearance(field.id, [
                {
                  operation: "updateEditor",
                  newFieldExtensionId: FIELD_EXTENSION_ID_AUTHOR,
                },
              ]);
            } else {
              await ctx.updateFieldAppearance(field.id, [
                {
                  operation: "updateEditor",
                  newFieldExtensionId: FIELD_EXTENSION_ID,
                },
              ]);
            }

            return true;
          })
        )
      ).some((x) => x);

      await ctx.updatePluginParameters(
        normalizeConfig(ctx.plugin.attributes.parameters)
      );

      if (someUpgraded) await ctx.notice("Plugin upgraded successfully!");
    },
    overrideFieldExtensions(field, ctx) {
      if (!["json"].includes(field.attributes.field_type)) return;
      const config = normalizeConfig(ctx.plugin.attributes.parameters);

      if (
        !config.autoApplyToFieldsWithApiKey ||
        !new RegExp(config.autoApplyToFieldsWithApiKey).test(
          field.attributes.api_key
        )
      )
        return;

      return {
        editor: { id: FIELD_EXTENSION_ID },
      };
    },
    manualFieldExtensions() {
      return [
        {
          id: FIELD_EXTENSION_ID_PREVIEW,
          name: "Preview Links",
          type: "editor",
          fieldTypes: ["json"],
          configurable: false,
          asSidebarPanel: {
            startOpen: true,
          },
        },
        {
          id: FIELD_ADDON_ID_DOCX,
          name: "Docx Import",
          type: "addon",
          fieldTypes: ["structured_text"],
          configurable: false,
        },
        {
          id: FIELD_EXTENSION_ID_AUTHOR,
          name: "Edit Authors",
          type: "editor",
          fieldTypes: ["json"],
        },
        {
          id: FIELD_EXTENSION_ID,
          name: "Shop Products",
          type: "editor",
          fieldTypes: ["json"],
        },
      ];
    },
    customMarksForStructuredTextField() {
      return StructuredTextFields;
    },
    validateManualFieldExtensionParameters(fieldExtensionId, parameters) {
      if (fieldExtensionId === FIELD_EXTENSION_ID_PREVIEW) {
        const errors: Record<string, string> = {};
        if (!parameters.entity_path) {
          errors.entity_path = "Please provide an entity path";
        }
        return errors;
      }
      return {};
    },
    assetSources() {
      return [
        {
          id: "optwebp",
          name: "Optimized Upload",
          icon: {
            type: "svg",
            viewBox: "0 0 448 512",
            content:
              '<path fill="currentColor" d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288H175.5L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7H272.5L349.4 44.6z"></path>',
          },
          modal: {
            width: "m",
          },
        },
      ];
    },
    mainNavigationTabs() {
      const pages: MainNavigationTab[] = [];

      if (hasFlag(Flags.Forms)) {
        pages.push({
          label: "Message Board",
          icon: "comments",
          pointsTo: {
            pageId: MESSAGE_BOARD_PAGE_ID,
          },
        });
      }

      return pages;
    },
  });

  if (!ctx) return null;
  switch (page) {
    case "ConfigScreen": {
      return <ConfigScreen ctx={ctx as RenderConfigScreenCtx} />;
    }
    case "FieldExtension": {
      switch (id) {
        case FIELD_EXTENSION_ID: {
          return <ShopFieldExtension ctx={ctx as RenderFieldExtensionCtx} />;
        }
        case FIELD_EXTENSION_ID_AUTHOR: {
          return <AuthorEditorExtension ctx={ctx as RenderFieldExtensionCtx} />;
        }
        case FIELD_ADDON_ID_DOCX: {
          return <DocxImportFieldAddon ctx={ctx as RenderFieldExtensionCtx} />;
        }
        case FIELD_EXTENSION_ID_PREVIEW: {
          return <PreviewLinkExtension ctx={ctx as RenderFieldExtensionCtx} />;
        }
        default:
          return null;
      }
    }
    case "Page": {
      if (id === MESSAGE_BOARD_PAGE_ID)
        return <MessageBoardManagerPage ctx={ctx as RenderPageCtx} />;
      return null;
    }
    case "Modal":
      if (id === "thread-model")
        return <EditThreadModel ctx={ctx as RenderModalCtx} />;
      if (id === "browseProducts")
        return <BrowseProductsModel ctx={ctx as RenderModalCtx} />;
      if (id === "editAuthor")
        return <EditAuthorModal ctx={ctx as RenderModalCtx} />;
      if (id === "storefrontModel")
        return <StorefrontModel ctx={ctx as RenderModalCtx} />;
      return null;
    case "AssetSource": {
      return <AssetSourceOptimized ctx={ctx as RenderAssetSourceCtx} />;
    }
    default:
      return null;
  }
};

export default MidwestRaptor;
