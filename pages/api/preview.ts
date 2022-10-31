import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.query.secret !== process.env.PREVIEW_TOKEN || !req.query.slug) {
        return res.status(401).json({ message: "Invaild token" });
    }

    // fetch headless for data.
    // make sure object exits

    const data = { slug: "" };

    // lasts for an hour.
    res.setPreviewData({},{ maxAge: 60 * 60, path: data.slug });

    res.redirect(data.slug);
}