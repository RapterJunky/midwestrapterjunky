import type { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

async function Migrate (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newPlugins: Record<string, SimpleSchemaTypes.Plugin> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log("Manage upload filters");

  console.log('Install plugin "Tag editor"');
  newPlugins["67009"] = await client.plugins.create({
    package_name: "datocms-plugin-tag-editor",
  });
  await client.plugins.update(newPlugins["67009"], {
    parameters: { paramsVersion: "2", autoApplyRules: [] },
  });

  console.log('Install plugin "Computed Fields"');
  newPlugins["67010"] = await client.plugins.create({
    package_name: "datocms-plugin-computed-fields",
  });
  await client.plugins.update(newPlugins["67010"], {
    parameters: { migratedFromLegacyPlugin: true },
  });

  console.log("Create new models/block models");

  console.log('Create model "Article" (`article`)');
  newItemTypes["1084572"] = await client.itemTypes.create(
    {
      name: "Article",
      api_key: "article",
      draft_mode_active: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: "true" }
  );

  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Article" (`article`)'
  );
  newFields["5692709"] = await client.fields.create(newItemTypes["1084572"], {
    label: "Title",
    field_type: "string",
    api_key: "title",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false },
    },
    default_value: "",
  });

  console.log(
    'Create JSON field "Tags" (`tags`) in model "Article" (`article`)'
  );
  newFields["5692710"] = await client.fields.create(newItemTypes["1084572"], {
    label: "Tags",
    field_type: "json",
    api_key: "tags",
    appearance: {
      addons: [],
      editor: newPlugins["67009"].id,
      parameters: {},
      field_extension: "tagEditor",
    },
  });

  console.log(
    'Create JSON field "Authors" (`authors`) in model "Article" (`article`)'
  );
  newFields["5692714"] = await client.fields.create(newItemTypes["1084572"], {
    label: "Authors",
    field_type: "json",
    api_key: "authors",
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "RJ_AUTHOR_EDITOR",
    },
  });

  console.log(
    'Create Structured text field "Article Content" (`content`) in model "Article" (`article`)'
  );
  newFields["5692713"] = await client.fields.create(newItemTypes["1084572"], {
    label: "Article Content",
    field_type: "structured_text",
    api_key: "content",
    validators: {
      structured_text_blocks: { item_types: ["878997"] },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: ["877554"],
      },
    },
    appearance: {
      addons: [{ id: "58636", parameters: {}, field_extension: "loremIpsum" }],
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
        blocks_start_collapsed: true,
        show_links_meta_editor: true,
        show_links_target_blank: true,
      },
    },
  });

  console.log('Create fieldset "Page Settings" in model "Article" (`article`)');
  newFieldsets["338405"] = await client.fieldsets.create(
    newItemTypes["1084572"],
    { title: "Page Settings" }
  );

  console.log(
    'Create SEO meta tags field "Seo" (`seo`) in model "Article" (`article`)'
  );
  newFields["5692712"] = await client.fields.create(newItemTypes["1084572"], {
    label: "Seo",
    field_type: "seo",
    api_key: "seo",
    validators: { title_length: { max: 60 }, description_length: { max: 160 } },
    appearance: { addons: [], editor: "seo", parameters: {} },
    fieldset: newFieldsets["338405"],
  });

  console.log(
    'Create JSON field "Preview" (`revalidate`) in model "Article" (`article`)'
  );
  newFields["5692715"] = await client.fields.create(newItemTypes["1084572"], {
    label: "Preview",
    field_type: "json",
    api_key: "revalidate",
    appearance: {
      addons: [],
      editor: "58596",
      parameters: { entity_path: "/blog/$slug" },
      field_extension: "preview",
    },
    default_value: '{\n  "type": "page",\n  "slug": "/blog/[slug]"\n,"cache":"blog-pages"}',
  });

  console.log(
    'Create Slug field "Slug" (`slug`) in model "Article" (`article`)'
  );
  newFields["5692711"] = await client.fields.create(newItemTypes["1084572"], {
    label: "Slug",
    field_type: "slug",
    api_key: "slug",
    validators: {
      slug_title_field: { title_field_id: newFields["5692709"].id },
      slug_format: { predefined_pattern: "webpage_slug" },
      required: {},
      unique: {},
    },
    appearance: { addons: [], editor: "slug", parameters: { url_prefix: "" } },
    fieldset: newFieldsets["338405"],
  });

  console.log("Finalize models/block models");

  console.log('Update model "Article" (`article`)');
  await client.itemTypes.update(newItemTypes["1084572"], {
    title_field: newFields["5692709"],
    excerpt_field: newFields["5692713"],
  });

  console.log("Manage menu items");

  console.log('Create menu item "Articles"');
  newMenuItems["553865"] = await client.menuItems.create({
    label: "Articles",
    item_type: newItemTypes["1084572"],
  });
}

export default Migrate;