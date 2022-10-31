import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if(req.query.secret !== process.env.REVALIDATE_TOKEN) {
        return res.status(400).json({ message: "Invaild token" });
    }

    try {

        await res.revalidate("/path");
    
        return res.json({ revalidated: true, path: "" });
    } catch (error: any) {

        console.error(error);

        return res.status(500).json({
            revalidated: false
        });
    }
}