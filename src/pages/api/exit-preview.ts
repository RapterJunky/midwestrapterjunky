import type { NextApiResponse } from "next";

export default async function handler(_: any, res: NextApiResponse) {
  res.clearPreviewData();
  res.redirect("/");
}
