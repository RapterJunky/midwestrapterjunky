import type { NextApiResponse } from "next";

export default function handler(_: never, res: NextApiResponse) {
  res.clearPreviewData();
  res.redirect("/");
}
