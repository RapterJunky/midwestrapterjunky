import type { NextApiResponse } from "next";

export default async function handler(_: never, res: NextApiResponse) {
  res.clearPreviewData();
  res.redirect("/");
}
