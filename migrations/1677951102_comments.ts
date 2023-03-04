import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {}; { };
  const newPlugins: Record<string, SimpleSchemaTypes.Plugin> = {};

  console.log("Manage upload filters");

  console.log('Install plugin "Typed List Editor"');
  newPlugins["101591"] = await client.plugins.create({
    package_name: "@stackbit/datocms-plugin-typed-list",
  });

  console.log("Create new models/block models");
  console.log("Creating new fields/fieldsets");

  console.log(
    'Create fieldset "Comments Settings" in model "Article" (`article`)'
  );
  newFieldsets["480521"] = await client.fieldsets.create("1084572", {
    title: "Comments Settings",
    hint: "Settings for the commets section.",
    collapsible: true,
    start_collapsed: true,
  });

  console.log(
    'Create Boolean field "Enable Comments" (`enable_comments`) in model "Article" (`article`)'
  );
  newFields["8129659"] = await client.fields.create("1084572", {
    label: "Enable Comments",
    field_type: "boolean",
    api_key: "enable_comments",
    hint: "Is the comments section is displayed on this article.",
    appearance: {
      addons: [
        {
          id: "58595",
          parameters: {
            invert: false,
            targetFieldsApiKey: ["display_comments", "comments_admins"],
          },
          field_extension: "conditionalFields",
        },
      ],
      editor: "boolean",
      parameters: {},
    },
    fieldset: newFieldsets["480521"],
  });

  console.log(
    'Create JSON field "Admins" (`comments_admins`) in model "Article" (`article`)'
  );
  newFields["8129660"] = await client.fields.create("1084572", {
    label: "Admins",
    field_type: "json",
    api_key: "comments_admins",
    hint: 'List of admins for comment moderation. Enter Facebook user Id. <a href="https://www.wikihow.com/Find-a-User-ID-on-Facebook">See how to find your user ID</a>.',
    appearance: {
      addons: [],
      editor: newPlugins["101591"].id,
      parameters: { type: "string", options: "" },
    },
    fieldset: newFieldsets["480521"],
  });

  console.log(
    'Create Integer number field "Display Comments" (`display_comments`) in model "Article" (`article`)'
  );
  newFields["8129661"] = await client.fields.create("1084572", {
    label: "Display Comments",
    field_type: "integer",
    api_key: "display_comments",
    hint: "How may comments are displayed by default.",
    appearance: { addons: [], editor: "integer", parameters: {} },
    default_value: 3,
    fieldset: newFieldsets["480521"],
  });


  console.log(
    'Update fieldset "Comments Settings" in model "Article" (`article`)'
  );
  await client.fieldsets.update(newFieldsets["480521"], { position: 5 });

  console.log(
    'Update Boolean field "Enable Comments" (`enable_comments`) in model "Article" (`article`)'
  );
  await client.fields.update(newFields["8129659"], { position: 0 });

  console.log(
    'Update JSON field "Admins" (`comments_admins`) in model "Article" (`article`)'
  );
  await client.fields.update(newFields["8129660"], { position: 1 });

  console.log(
    'Update Integer number field "Display Comments" (`display_comments`) in model "Article" (`article`)'
  );
  await client.fields.update(newFields["8129661"], { position: 2 });


  console.log("Finalize models/block models");
  console.log("Manage menu items");

  console.log('Update menu item "Articles"');
  await client.menuItems.update("553865", { position: 6 });
}
