import { Client } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  console.log("Manage upload filters");

  console.log('Delete plugin "Next.js Sidebar Preview Button"');
  await client.plugins.destroy("58596");

  console.log("Create new models/block models");
  console.log("Creating new fields/fieldsets");

  console.log("Destroy fields in existing models/block models");
  console.log("Update existing fields/fieldsets");

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Home" (`home`)'
  );
  await client.fields.update("4934120", {
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "mrj_preview_link",
    },
  });

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Navbar" (`navbar`)'
  );
  await client.fields.update("4935317", {
    label: "Preview",
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "mrj_preview_link",
    },
  });

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Event" (`event`)'
  );
  await client.fields.update("4934121", {
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "mrj_preview_link",
    },
  });

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "About Us" (`about_us_model`)'
  );
  await client.fields.update("4705771", {
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "mrj_preview_link",
    },
  });

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Calendar" (`calendar`)'
  );
  await client.fields.update("4608845", {
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "mrj_preview_link",
    },
  });

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Article" (`article`)'
  );
  await client.fields.update("5692715", {
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "mrj_preview_link",
    },
  });

  console.log(
    'Update Slug field "Slug" (`slug`) in model "Article" (`article`)'
  );
  await client.fields.update("5692711", {
    appearance: {
      addons: [],
      editor: "slug",
      parameters: { url_prefix: "https://midwestraptorjunkies.com/blog/" },
    },
  });

  console.log(
    'Update JSON field "Preview" (`revalidate`) in model "Sponsor" (`sponsor`)'
  );
  await client.fields.update("6704409", {
    appearance: {
      addons: [],
      editor: "58601",
      parameters: {},
      field_extension: "mrj_preview_link",
    },
  });

  console.log("Destroy models/block models");
  console.log("Finalize models/block models");
  console.log("Manage menu items");
}
