/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */
module PrismaJson {
  type AuthorSocial = { link: string; user: string };

  type DastRootTypes = Array<
    | import("datocms-structured-text-utils").Paragraph
    | import("datocms-structured-text-utils").Heading
    | import("datocms-structured-text-utils").Block
    | import("datocms-structured-text-utils").List
    | import("datocms-structured-text-utils").Blockquote
    | import("datocms-structured-text-utils").Code
    | import("datocms-structured-text-utils").ThematicBreak
  >;

  type Dast<B = import("react-datocms").Record, L = import("react-datocms").Record> = import("react-datocms").StructuredTextGraphQlResponse<B, L>;

  type PostComment = { message: string };
}
