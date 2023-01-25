import type { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log("Create new models/block models");

  console.log('Create model "Sponsor" (`sponsor`)');
  newItemTypes["1278380"] = await client.itemTypes.create(
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

  console.log('Create block model "SponsorBlock" (`sponsorblock`)');
  newItemTypes["1278398"] = await client.itemTypes.create(
    {
      name: "SponsorBlock",
      api_key: "sponsorblock",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: "true" }
  );

  console.log("Creating new fields/fieldsets");


  console.log('Create fieldset "Page Settings" in model "Sponsor" (`sponsor`)');
  newFieldsets["395544"] = await client.fieldsets.create(
    newItemTypes["1278380"],
    { title: "Page Settings", collapsible: true, start_collapsed: true }
  );

  console.log(
    'Create SEO meta tags field "Seo" (`seo`) in model "Sponsor" (`sponsor`)'
  );
  newFields["6704359"] = await client.fields.create(newItemTypes["1278380"], {
    label: "Seo",
    field_type: "seo",
    api_key: "seo",
    validators: { title_length: { max: 60 }, description_length: { max: 160 } },
    appearance: { addons: [], editor: "seo", parameters: {} },
    fieldset: newFieldsets["395544"],
  });

  console.log(
    'Create JSON field "Preview" (`preview`) in model "Sponsor" (`sponsor`)'
  );
  newFields["6704409"] = await client.fields.create(newItemTypes["1278380"], {
    label: "Preview",
    field_type: "json",
    api_key: "preview",
    appearance: {
      addons: [],
      editor: "58596",
      parameters: { entity_path: "/sponsors" },
      field_extension: "preview",
    },
    default_value: '{\n  "type": "page",\n  "slug": "/sponsors"\n}',
    fieldset: newFieldsets["395544"],
  });

  console.log(
    'Create Modular content field "Sponsors" (`sponsors`) in model "Sponsor" (`sponsor`)'
  );
  newFields["6704410"] = await client.fields.create(newItemTypes["1278380"], {
    label: "Sponsors",
    field_type: "rich_text",
    api_key: "sponsors",
    validators: {
      rich_text_blocks: { item_types: [newItemTypes["1278398"].id] },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: true },
    },
  });

  console.log(
    'Create Single-line string field "Sponsor Name" (`sponsor_name`) in block model "SponsorBlock" (`sponsorblock`)'
  );
  newFields["6704411"] = await client.fields.create(newItemTypes["1278398"], {
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
  newFields["6704412"] = await client.fields.create(newItemTypes["1278398"], {
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
  newFields["6704413"] = await client.fields.create(newItemTypes["1278398"], {
    label: "Logo",
    field_type: "file",
    api_key: "logo",
    validators: { required: {} },
    appearance: { addons: [], editor: "file", parameters: {} },
  });

  console.log("Destroy models/block models");

  console.log('Delete model "Schema migration" (`schema_migration`)');
  await client.itemTypes.destroy("1268266", {
    skip_menu_items_deletion: "true",
  });

  console.log("Finalize models/block models");

  console.log("Manage menu items");

  console.log('Create menu item "Sponsors"');
  newMenuItems["654566"] = await client.menuItems.create({
    label: "Sponsors",
    item_type: newItemTypes["1278380"],
  });

  console.log('Delete menu item "Schema migration"');
  await client.menuItems.destroy("649680");

  console.log('Update menu item "Articles"');
  await client.menuItems.update("553865", { position: 6 });

  console.log('Update menu item "Sponsors"');
  await client.menuItems.update("654566", { position: 7 });

  console.log('Update menu item "Events"');
  await client.menuItems.update("458454", { label: "Events", position: 5 });

  console.log('Update menu item "Calendar"');
  await client.menuItems.update("463935", { position: 4 });
}
