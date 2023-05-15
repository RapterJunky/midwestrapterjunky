import type { NextApiResponse } from "next";

export default function handler(_: never, res: NextApiResponse) {
  //res.setDraftMode({ enable: false });

  res.clearPreviewData();

  res.redirect("/");
}
