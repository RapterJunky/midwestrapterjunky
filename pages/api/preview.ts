import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

     //Check that the secret matches and that the slug parameter exists (if not, the request should fail)
    if(req.query.secret !== process.env.PREVIEW_TOKEN || !req.query.slug) {
        return res.status(401).json({ message: "Invaild token" });
    }

    // fetch headless for data.
    // make sure object exits

    const data = { slug: req.query.slug as string };

    // lasts for an hour.
    res.setPreviewData({},{ maxAge: 60 * 60, path: data.slug });

    res.redirect(data.slug);
}