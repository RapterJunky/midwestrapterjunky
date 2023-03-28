import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newPlugins: Record<string, SimpleSchemaTypes.Plugin> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log("Manage upload filters");

  try {
    console.log('Delete plugin "Typed List Editor"');
    await client.plugins.destroy("101610");
  } catch (error) {
    console.error(error?.message ?? error)
  }

  try {
    console.log('Install plugin "Typed List Editor"');
    newPlugins["101591"] = await client.plugins.create({
      package_name: "@stackbit/datocms-plugin-typed-list",
    });
  } catch (error) {
    console.error(error?.message ?? error)
  }

  console.log("Create new models/block models");

  try {
    console.log('Create model "Terms And Privacy" (`termsandprivacy`)');
    newItemTypes["1566000"] = await client.itemTypes.create(
      {
        name: "Terms And Privacy",
        singleton: true,
        api_key: "termsandprivacy",
        draft_mode_active: true,
        all_locales_required: true,
        collection_appearance: "table",
        inverse_relationships_enabled: false,
      },
      { skip_menu_item_creation: "true" }
    );
  } catch (error) {
    console.error(error?.message ?? error)
  }

  console.log("Creating new fields/fieldsets");

  try {
    console.log(
      'Create fieldset "Terms Of Service" in model "Terms And Privacy" (`termsandprivacy`)'
    );
    newFieldsets["481392"] = await client.fieldsets.create(
      newItemTypes["1566000"],
      {
        title: "Terms Of Service",
        hint: "Settings for Terms of Service Page",
        collapsible: true,
        start_collapsed: true,
      }
    );
  } catch (error) {
    console.error(error?.message ?? error)
  }

  try {
    console.log(
      'Create fieldset "Privacy Policy" in model "Terms And Privacy" (`termsandprivacy`)'
    );
    newFieldsets["481393"] = await client.fieldsets.create(
      newItemTypes["1566000"],
      {
        title: "Privacy Policy",
        hint: "Page Settings for Privacy Policy",
        collapsible: true,
        start_collapsed: true,
      }
    );
  } catch (error) {
    console.error(error.message);
  }


  try {
    console.log(
      'Create Structured text field "Terms Of Service" (`terms_of_service`) in model "Terms And Privacy" (`termsandprivacy`)'
    );
    newFields["8141691"] = await client.fields.create(newItemTypes["1566000"], {
      label: "Terms Of Service",
      field_type: "structured_text",
      api_key: "terms_of_service",
      hint: "Terms of Service Document",
      validators: {
        required: {},
        structured_text_blocks: { item_types: [] },
        structured_text_links: {
          on_publish_with_unpublished_references_strategy: "fail",
          on_reference_unpublish_strategy: "delete_references",
          on_reference_delete_strategy: "delete_references",
          item_types: [],
        },
      },
      appearance: {
        addons: [
          { id: "58601", parameters: {}, field_extension: "mrj_docx_import" },
          { id: "58636", parameters: {}, field_extension: "loremIpsum" },
        ],
        editor: "structured_text",
        parameters: {
          marks: [
            "strong",
            "code",
            "emphasis",
            "underline",
            "strikethrough",
            "highlight",
          ],
          nodes: [
            "blockquote",
            "code",
            "heading",
            "link",
            "list",
            "thematicBreak",
          ],
          heading_levels: [1, 2, 3, 4, 5, 6],
          blocks_start_collapsed: false,
          show_links_meta_editor: false,
          show_links_target_blank: true,
        },
      },
      fieldset: newFieldsets["481392"],
    });
  } catch (error) {
    console.error(error?.message ?? error)
  }

  try {
    console.log(
      'Create Structured text field "Privacy Policy" (`privacy_policy`) in model "Terms And Privacy" (`termsandprivacy`)'
    );
    newFields["8141696"] = await client.fields.create(newItemTypes["1566000"], {
      label: "Privacy Policy",
      field_type: "structured_text",
      api_key: "privacy_policy",
      hint: "Privacy Policy Document",
      validators: {
        required: {},
        structured_text_blocks: { item_types: [] },
        structured_text_links: {
          on_publish_with_unpublished_references_strategy: "fail",
          on_reference_unpublish_strategy: "delete_references",
          on_reference_delete_strategy: "delete_references",
          item_types: [],
        },
      },
      appearance: {
        addons: [
          { id: "58601", parameters: {}, field_extension: "mrj_docx_import" },
          { id: "58636", parameters: {}, field_extension: "loremIpsum" },
        ],
        editor: "structured_text",
        parameters: {
          marks: [
            "strong",
            "code",
            "emphasis",
            "underline",
            "strikethrough",
            "highlight",
          ],
          nodes: [
            "blockquote",
            "code",
            "heading",
            "link",
            "list",
            "thematicBreak",
          ],
          heading_levels: [1, 2, 3, 4, 5, 6],
          blocks_start_collapsed: false,
          show_links_meta_editor: false,
          show_links_target_blank: true,
        },
      },
      fieldset: newFieldsets["481393"],
    });
  } catch (error) {
    console.error(error?.message ?? error)
  }

  try {
    console.log(
      'Create SEO meta tags field "Terms Of Service SEO" (`terms_of_service_seo`) in model "Terms And Privacy" (`termsandprivacy`)'
    );
    newFields["8141692"] = await client.fields.create(newItemTypes["1566000"], {
      label: "Terms Of Service SEO",
      field_type: "seo",
      api_key: "terms_of_service_seo",
      hint: "SEO Settings for Terms of Service Page",
      validators: { title_length: { max: 60 }, description_length: { max: 160 } },
      appearance: { addons: [], editor: "seo", parameters: {} },
      fieldset: newFieldsets["481392"],
    });
  } catch (error) {
    console.error(error?.message ?? error)
  }

  try {
    console.log(
      'Create SEO meta tags field "Privacy Policy SEO" (`privacy_policy_seo`) in model "Terms And Privacy" (`termsandprivacy`)'
    );
    newFields["8141698"] = await client.fields.create(newItemTypes["1566000"], {
      label: "Privacy Policy SEO",
      field_type: "seo",
      api_key: "privacy_policy_seo",
      hint: "SEO setting for Privacy Policy",
      validators: { title_length: { max: 60 }, description_length: { max: 160 } },
      appearance: { addons: [], editor: "seo", parameters: {} },
      fieldset: newFieldsets["481393"],
    });
  } catch (error) {
    console.error(error?.message ?? error)
  }

  try {
    console.log(
      'Delete Color field "Background Color" (`bg_color`) in model "Navbar" (`navbar`)'
    );
    await client.fields.destroy("4559473");
  } catch (error) {
    console.error(error?.message ?? error)
  }

  console.log("Update existing fields/fieldsets");

  console.log("Destroy models/block models");

  console.log("Finalize models/block models");

  try {
    console.log('Update model "Schema migration" (`schema_migration`)');
    await client.itemTypes.update("1394399", {
      title_field: newFields["7285477"],
    });
  } catch (error) {
    console.error(error?.message ?? error);
  }

  console.log("Manage menu items");

  try {
    console.log('Create menu item "Site Terms"');
    newMenuItems["806216"] = await client.menuItems.create({
      label: "Site Terms",
      item_type: newItemTypes["1566000"],
    });
  } catch (error) {
    console.error(error?.message ?? error)
  }

  try {
    console.log('Update menu item "Site Terms"');
    await client.menuItems.update(newMenuItems["806216"].id, { position: 11 });
  } catch (error) {
    console.error(error?.message ?? error);
  }

  //console.log('Delete menu item "Schema migration"');
  //await client.menuItems.destroy("716095");

  try {
    console.log('Update menu item "Schema migration"');
    await client.menuItems.update("716095", { position: 11 });
  } catch (error) {
    console.error(error?.message ?? error);
  }
}
