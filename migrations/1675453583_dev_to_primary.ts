import type { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

const HandlePlugins = async (client: Client) => {
  console.log('Checking Plugins...');

  const plugins: Record<string, SimpleSchemaTypes.Plugin> = {};
  const currentPlugins = await client.plugins.list();

  const TagEditor = currentPlugins.find(value=>value.package_name==="datocms-plugin-tag-editor");

  if(!TagEditor) {
      console.log('  Install plugin "Tag editor"');
      plugins["TagEditor"] = await client.plugins.create({
        package_name: "datocms-plugin-tag-editor",
      });
      await client.plugins.update(plugins["TagEditor"], {
        parameters: { paramsVersion: "2", autoApplyRules: [] },
      });
  } else {
    plugins["TagEditor"] = TagEditor;
    console.log('  Plugin "Tag Editor" already exists!');
  }

  const ComputedFields = currentPlugins.find(value=>value.package_name==="datocms-plugin-computed-fields");
  
  if(!ComputedFields) {
      console.log('Install plugin "Computed Fields"');
      plugins["ComputedFields"] = await client.plugins.create({
        package_name: "datocms-plugin-computed-fields",
      });
      await client.plugins.update(plugins["ComputedFields"], {
        parameters: { migratedFromLegacyPlugin: true },
      });
  } else {
    console.log('  Plugin "Computed Fields" already exists!');
    plugins["ComputedFields"] = ComputedFields;
  }


  const Rapter = currentPlugins.find(value=>value.name === "MidwestRapter");
  if(!Rapter) throw new Error("Failed to find Rapter Plugin");
  plugins["rapter"] = Rapter;

  return plugins;
}

const ArticleModel = async (client: Client, newPlugins: Record<string, SimpleSchemaTypes.Plugin>) => {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};

  console.log('Create model "Article" (`article`)');
  newItemTypes["Article"] = await client.itemTypes.create(
    {
      name: "Article",
      api_key: "article",
      draft_mode_active: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: "true" }
  );

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Article" (`article`)'
  );
  newFields["Title"] = await client.fields.create(newItemTypes["Article"], {
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
  newFields["Tags"] = await client.fields.create(newItemTypes["Article"], {
    label: "Tags",
    field_type: "json",
    api_key: "tags",
    appearance: {
      addons: [],
      editor: newPlugins["tagEditor"].id,
      parameters: {},
      field_extension: "tagEditor",
    },
  });

  console.log(
    'Create JSON field "Authors" (`authors`) in model "Article" (`article`)'
  );
  newFields["Authors"] = await client.fields.create(newItemTypes["Article"], {
    label: "Authors",
    field_type: "json",
    api_key: "authors",
    appearance: {
      addons: [],
      editor: newPlugins["rapter"].id,
      parameters: {},
      field_extension: "RJ_AUTHOR_EDITOR",
    },
  });

  console.log(
    'Create Structured text field "Article Content" (`content`) in model "Article" (`article`)'
  );
  newFields["Content"] = await client.fields.create(newItemTypes["Article"], {
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
  newFieldsets["pageSettings"] = await client.fieldsets.create(
    newItemTypes["Article"],
    { title: "Page Settings", collapsible: true, start_collapsed: true }
  );

  console.log(
    'Create Slug field "Slug" (`slug`) in model "Article" (`article`)'
  );
  newFields["Slug"] = await client.fields.create(newItemTypes["Article"], {
    label: "Slug",
    field_type: "slug",
    api_key: "slug",
    validators: {
      slug_title_field: { title_field_id: newFields["Title"].id },
      slug_format: { predefined_pattern: "webpage_slug" },
      required: {},
      unique: {},
    },
    appearance: { addons: [], editor: "slug", parameters: { url_prefix: "" } },
    fieldset: newFieldsets["pageSettings"],
  });

  console.log(
    'Create SEO meta tags field "Seo" (`seo`) in model "Article" (`article`)'
  );
  newFields["Seo"] = await client.fields.create(newItemTypes["Article"], {
    label: "Seo",
    field_type: "seo",
    api_key: "seo",
    validators: { title_length: { max: 60 }, description_length: { max: 160 } },
    appearance: { addons: [], editor: "seo", parameters: {} },
    fieldset: newFieldsets["pageSettings"],
  });

  console.log(
    'Create JSON field "Preview" (`revalidate`) in model "Article" (`article`)'
  );
  newFields["revalidate"] = await client.fields.create(newItemTypes["Article"], {
    label: "Preview",
    field_type: "json",
    api_key: "revalidate",
    fieldset: newFieldsets["pageSettings"],
    appearance: {
      addons: [],
      editor: "58596",
      parameters: { entity_path: "/blog/$slug" },
      field_extension: "preview",
    },
    default_value: '{\n"type":"page-cache",\n"slug":"/blog/[slug]"\n,"cache":"blog-pages"}',
  });

  console.log('Update model "Article" (`article`)');
  await client.itemTypes.update(newItemTypes["Article"], {
    title_field: newFields["Title"],
    excerpt_field: newFields["Content"],
  });

  return {
    newFields,
    newFieldsets,
    newItemTypes,
  }
}

const SponoursModel = async (client: Client, newPlugins: Record<string, SimpleSchemaTypes.Plugin>) => {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};

  console.log('Create block model "SponsorBlock" (`sponsorblock`)');
  newItemTypes["ContentBlock"] = await client.itemTypes.create(
    {
      name: "SponsorBlock",
      api_key: "sponsorblock",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: "true" }
  );

  console.log('Create model "Sponsor" (`sponsor`)');
  newItemTypes["Sponsor"] = await client.itemTypes.create(
    {
      name: "Sponsor",
      singleton: true,
      api_key: "sponsor",
      draft_mode_active: true,
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: "true" }
  );

  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single-line string field "Sponsor Name" (`sponsor_name`) in block model "SponsorBlock" (`sponsorblock`)'
  );
  newFields["SponsorName"] = await client.fields.create(newItemTypes["ContentBlock"], {
    label: "Sponsor Name",
    field_type: "string",
    api_key: "sponsor_name",
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false },
    },
    default_value: "",
  });
  console.log(
    'Create Single-line string field "Link" (`link`) in block model "SponsorBlock" (`sponsorblock`)'
  );
  newFields["SponsorLink"] = await client.fields.create(newItemTypes["ContentBlock"], {
    label: "Link",
    field_type: "string",
    api_key: "link",
    validators: { format: { predefined_pattern: "url" } },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false },
    },
    default_value: "",
  });
  console.log(
    'Create Single asset field "Logo" (`logo`) in block model "SponsorBlock" (`sponsorblock`)'
  );
  newFields["SponsorLogo"] = await client.fields.create(newItemTypes["ContentBlock"], {
    label: "Logo",
    field_type: "file",
    api_key: "logo",
    validators: { required: {} },
    appearance: { addons: [], editor: "file", parameters: {} },
  });

  console.log(
    'Create Modular content field "Sponsors" (`sponsors`) in model "Sponsor" (`sponsor`)'
  );
  newFields["Sponsors"] = await client.fields.create(newItemTypes["Sponsor"], {
    label: "Sponsors",
    field_type: "rich_text",
    api_key: "sponsors",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["ContentBlock"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: true },
    },
  });

  console.log('Create fieldset "Page Settings" in model "Sponsor" (`sponsor`)');
  newFieldsets["PageSettings"] = await client.fieldsets.create(
    newItemTypes["Sponsor"],
    { title: "Page Settings", collapsible: true, start_collapsed: true }
  );

  console.log(
    'Create SEO meta tags field "Seo" (`seo`) in model "Sponsor" (`sponsor`)'
  );
  newFields["Seo"] = await client.fields.create(newItemTypes["Sponsor"], {
    label: "Seo",
    field_type: "seo",
    api_key: "seo",
    validators: { title_length: { max: 60 }, description_length: { max: 160 } },
    appearance: { addons: [], editor: "seo", parameters: {} },
    fieldset: newFieldsets["PageSettings"],
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "Sponsor" (`sponsor`)'
  );
  newFields["6704409"] = await client.fields.create(newItemTypes["Sponsor"], {
    label: "Preview",
    field_type: "json",
    api_key: "revalidate",
    appearance: {
      addons: [],
      editor: "58596",
      parameters: { entity_path: "/sponsors" },
      field_extension: "preview",
    },
    default_value: '{\n  "type": "page",\n  "slug": "/sponsors"\n}',
    fieldset: newFieldsets["PageSettings"],
  });
  return {
    newFields,
    newFieldsets,
    newItemTypes,
  }
}

async function Migrate (client: Client) {
  console.log("Manage upload filters");

  const newPlugins = await HandlePlugins(client);

  console.log("Create new models/block models");

  const article = await ArticleModel(client,newPlugins);
  const sponsours = await SponoursModel(client,newPlugins);

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Home" (`home`)'
  );
  await client.fields.update("4934120", { api_key: "revalidate" });
  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Event" (`event`)'
  );
  await client.fields.update("4934121", { api_key: "revalidate" });
  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "About Us" (`about_us_model`)'
  );
  await client.fields.update("4705771", { api_key: "revalidate" });
  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Calendar" (`calendar`)'
  );
  await client.fields.update("4608845", { api_key: "revalidate" });
  console.log(
    'Update Multiple-paragraph text field "content" (`content`) in block model "Custom Html Section" (`custom_html_section`)'
  );
  await client.fields.update("4934630", {
    appearance: {
      addons: [],
      editor: "wysiwyg",
      parameters: {
        toolbar: [
          "format",
          "bold",
          "italic",
          "strikethrough",
          "ordered_list",
          "unordered_list",
          "quote",
          "table",
          "link",
          "image",
          "show_source",
          "fullscreen",
        ],
      },
      type: "wysiwyg",
    },
  });

  console.log("Manage menu items");
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log('Create menu item "Articles"');
  newMenuItems["MenuItemArticles"] = await client.menuItems.create({
    label: "Articles",
    item_type: article.newItemTypes["Article"],
  });

  console.log('Create menu item "Sponsors"');
  newMenuItems["MenuItemSponsours"] = await client.menuItems.create({
    label: "Sponsors",
    item_type: sponsours.newItemTypes["Sponsor"],
  });

  console.log('Update menu item "Events"');
  await client.menuItems.update("458454", { label: "Events" });

  const menuItems = await client.menuItems.list();

  const id = menuItems.find(value=>value.label === "Schema migration");
  if(id) {
    console.log('Delete menu item "Schema migration"');
    await client.menuItems.destroy(id.id);
  }
  
}

export default Migrate;