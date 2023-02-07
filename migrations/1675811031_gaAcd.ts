import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log("Create new models/block models");

  console.log('Create block model "Countdown" (`countdown`)');
  newItemTypes["1371127"] = await client.itemTypes.create(
    {
      name: "Countdown",
      api_key: "countdown",
      modular_block: true,
      hint: "A countdown to a given event.",
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: "true" }
  );

  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single-line string field "Heading" (`heading`) in block model "Countdown" (`countdown`)'
  );
  newFields["7174074"] = await client.fields.create(newItemTypes["1371127"], {
    label: "Heading",
    field_type: "string",
    api_key: "heading",
    hint: "A title to give to the countdown. Example, Countdown to event name.",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false },
    },
    default_value: "Countdown",
  });

  console.log(
    'Create Single link field "Event" (`event`) in block model "Countdown" (`countdown`)'
  );
  newFields["7174073"] = await client.fields.create(newItemTypes["1371127"], {
    label: "Event",
    field_type: "link",
    api_key: "event",
    hint: "The Event you want to countdown to.",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: ["877554"],
      },
      required: {},
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
  });

  console.log(
    'Create Color field "Background Color" (`bg_color`) in block model "Countdown" (`countdown`)'
  );
  newFields["7238989"] = await client.fields.create(newItemTypes["1371127"], {
    label: "Background Color",
    field_type: "color",
    api_key: "bg_color",
    appearance: {
      addons: [],
      editor: "color_picker",
      parameters: { enable_alpha: false, preset_colors: ["#627647"] },
    },
    default_value: { red: 98, green: 118, blue: 71, alpha: 255 },
  });

  console.log(
    'Create Single-line string field "YoutubeID" (`youtubeid`) in block model "VideoWithLink" (`videowithlink`)'
  );
  newFields["7276453"] = await client.fields.create("877672", {
    label: "YoutubeID",
    field_type: "string",
    api_key: "youtubeid",
    appearance: {
      addons: [],
      editor: "67010",
      parameters: {
        editFunction: false,
        defaultFunction:
          'const getPath = (value) => datoCmsPlugin.fieldPath.replace("youtubeid",value);\nconst fieldValue = getFieldValue(datoCmsPlugin.formValues, getPath("video_link"));\nconst video = new URL(fieldValue);\n\nif(video.hostname === "www.youtube.com") {\n  //datoCmsPlugin.setFieldValue(getPath("is_youtube_video"),true);\n  return video?.searchParams?.get("v") ?? "";\n}\n\nreturn "";',
      },
      field_extension: "computedFields",
    },
    default_value: "",
  });

  console.log("Update existing fields/fieldsets");

  console.log(
    'Update Modular content field "Body Content" (`body_content`) in model "Home" (`home`)'
  );
  await client.fields.update("4559469", {
    validators: {
      rich_text_blocks: {
        item_types: [
          "877322",
          "877323",
          "877511",
          "877550",
          "877599",
          "877602",
          "877668",
          "877669",
          "877671",
          "877672",
          "950473",
          newItemTypes["1371127"].id,
        ],
      },
    },
  });

  console.log(
    'Update Color field "Text Color" (`color`) in block model "VideoWithLink" (`videowithlink`)'
  );
  await client.fields.update("4561554", { position: 5 });

  console.log(
    'Update Boolean field "Is Youtube Video" (`is_youtube_video`) in block model "VideoWithLink" (`videowithlink`)'
  );
  await client.fields.update("4561555", {
    appearance: {
      addons: [
        {
          id: "58595",
          parameters: { invert: false, targetFieldsApiKey: ["youtubeid"] },
          field_extension: "conditionalFields",
        },
      ],
      editor: "boolean",
      parameters: {},
    },
  });

  console.log("Manage menu items");

  console.log('Create menu item "Analytics"');
  newMenuItems["711567"] = await client.menuItems.create({
    label: "Analytics",
    external_url:
      "https://analytics.google.com/analytics/web/?authuser=2#/p352650441/reports/intelligenthome",
    open_in_new_tab: true,
  });
}
