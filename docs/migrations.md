# CMS Migrations 

See for more https://www.datocms.com/docs/scripting-migrations/scripting-migrations-with-the-datocms-cli

## Apply migrations to primary

If some users are in the process of editing any record when you launch the command, DatoCMS will warn you and fail the execution of the command. You can force the activation using the --force flag
1. `npx datocms maintenance:on`
1. `npx datocms migrations:run --destination=new-main`
1.  Test your app pointing to the new sandbox
1. `npx datocms environments:promote new-main` 
1. `npx datocms maintenance:off`

## Create new migrations

1. `npx datocms migrations:new NAME --autogenerate=FROM:TO`
1. Check Result