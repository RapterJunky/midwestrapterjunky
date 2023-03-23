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

  type Dast = import("react-datocms").StructuredTextGraphQlResponse;

  type PostComment = { message: string };
}
