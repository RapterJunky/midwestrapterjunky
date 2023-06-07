import type {
  RenderConfigScreenCtx,
  RenderFieldExtensionCtx,
  RenderPageCtx,
  RenderModalCtx,
  RenderAssetSourceCtx,
} from "datocms-plugin-sdk";
import type { NextPage } from "next";
import dynamic from "next/dynamic";

import { useDatoCMS } from "@hook/plugins/useDatoCms";
import StructuredTextFields from "@lib/plugin/StructuredTextFields";
import { isVaildConfig, normalizeConfig } from "@lib/utils/plugin/config";

import "datocms-react-ui/styles.css";

const FIELD_EXTENSION_ID_PREVIEW = "mrj_preview_link";
const FIELD_EXTENSION_ID_AUTHOR = "RJ_AUTHOR_EDITOR";
const FIELD_EXTENSION_ID = "shopProduct";

const MODEL_THEAD_ID = "thread-model";
const MODEL_BROWSE_PRODUCTS_ID = "browseProducts";
const MODEL_EDIT_AUTHOR_ID = "editAuthor";
const MODEL_STOREFRONT_ID = "storefrontModel";
const MODEL_GDRIVE_ID = "gDriveModel";
const MODEL_MAIL_SETTINGS_ID = "mrj_mail_settings";

const FIELD_ADDON_GDRIVE_ID = "mrj_gdrive";
const FIELD_ADDON_ID_DOCX = "mrj_docx_import";

const MESSAGE_BOARD_PAGE_ID = "community";

const MailSettingsModel = dynamic(
  () => import("@/components/plugins/models/MailSettingsModel")
);

const GDriveAddon = dynamic(
  () => import("@components/plugins/addon/GDriveAddon")
);
const GDriveModel = dynamic(
  () => import("@components/plugins/models/GDriveModal")
);

const ConfigScreen = dynamic(() => import("@components/plugins/ConfigScreen"));
const ShopFieldExtension = dynamic(
  () => import("@components/plugins/extension/ShopFieldExtension")
);
const AuthorEditorExtension = dynamic(
  () => import("@components/plugins/extension/AuthorEditorExtension")
);
const EditAuthorModal = dynamic(
  () => import("@components/plugins/models/EditAuthorModel")
);
const StorefrontModel = dynamic(
  () => import("@components/plugins/models/StorefrontModel")
);
const BrowseProductsModel = dynamic(
  () => import("@components/plugins/models/BrowseProductsModal")
);
const MessageBoardManagerPage = dynamic(
  () => import("@components/plugins/page/CommunityPage")
);
const EditThreadModel = dynamic(
  () => import("@components/plugins/models/EditThreadModel")
);
const DocxImportFieldAddon = dynamic(
  () => import("@components/plugins/addon/DocxImportFieldAddon")
);
const PreviewLinkExtension = dynamic(
  () => import("@components/plugins/extension/PreviewLinkExtension")
);

const MidwestRaptor: NextPage = () => {
  const { id, page, ctx } = useDatoCMS({
    renderConfigScreen: true,
    renderFieldExtension: true,
    renderPage: true,
    renderModal: true,
    renderAssetSource: false,
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
          id: FIELD_ADDON_GDRIVE_ID,
          type: "editor",
          fieldTypes: ["json"],
          name: "Google Drive",
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
    mainNavigationTabs() {
      return [
        {
          label: "Community",
          icon: "comments",
          pointsTo: {
            pageId: MESSAGE_BOARD_PAGE_ID,
          },
        },
      ];
    },
  });

  if (!ctx) return null;
  switch (page) {
    case "ConfigScreen": {
      return <ConfigScreen ctx={ctx as RenderConfigScreenCtx} />;
    }
    case "FieldExtension": {
      switch (id) {
        case FIELD_ADDON_GDRIVE_ID:
          return <GDriveAddon ctx={ctx as RenderFieldExtensionCtx} />;
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
      switch (id) {
        case MODEL_THEAD_ID:
          return <EditThreadModel ctx={ctx as RenderModalCtx} />;
        case MODEL_BROWSE_PRODUCTS_ID:
          return <BrowseProductsModel ctx={ctx as RenderModalCtx} />;
        case MODEL_EDIT_AUTHOR_ID:
          return <EditAuthorModal ctx={ctx as RenderModalCtx} />;
        case MODEL_STOREFRONT_ID:
          return <StorefrontModel ctx={ctx as RenderModalCtx} />;
        case MODEL_GDRIVE_ID:
          return <GDriveModel ctx={ctx as RenderModalCtx} />;
        case MODEL_MAIL_SETTINGS_ID:
          return <MailSettingsModel ctx={ctx as RenderModalCtx} />;
        default:
          return null;
      }
    default:
      return null;
  }
};

export default MidwestRaptor;
