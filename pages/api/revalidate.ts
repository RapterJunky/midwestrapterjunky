import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const auth = req.headers.authorization;
        const startWithBearer = auth?.startsWith("Bearer ");
        const token = auth?.replace("Bearer ","");

        if(!auth || !startWithBearer || token !== process.env.REVALIDATE_TOKEN) {
            return res.status(400).json({ message: "Invaild token" });
        }

        const body = req.body as { entity: { 
            attributes: {
                slug: string; 
            }
        } };

        await res.revalidate(body.entity.attributes.slug);
    
        return res.json({ revalidated: true, path: body.entity.attributes.slug });
    } catch (error: any) {

        console.error(error);

        return res.status(500).json({
            revalidated: false
        });
    }
}