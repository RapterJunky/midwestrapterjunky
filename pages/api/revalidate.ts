import type { NextApiRequest, NextApiResponse } from "next";

interface WebhookRequest {
    entity_type: string;
    event_type: string;
    entity: {
        id: string;
        type: string;
        attributes: {
            preview?: string;
        }
    }
}

const auth = (req: NextApiRequest) => {
    const header = req.headers.authorization;

    if(!header?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const token = header.replace("Bearer ","");

    if(token !== process.env.REVALIDATE_TOKEN) throw new Error("Unauthorized");
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        auth(req);

        const env = req.headers["x-environment"] as string | undefined;
        const siteId = req.headers["x-site-id"] as string | undefined;
        const hookId = req.headers["x-webhook-id"] as string | undefined;

        if(!hookId) throw new Error("No webhook id");
        
        console.log(`Environment: ${env} | Site: ${siteId} | Webhook ID: ${hookId}`);

        const body = req.body as WebhookRequest;

        const data = JSON.parse(body.entity.attributes?.preview ?? "null") as { slug: string; other: string[] };

        if(data.slug) res.revalidate(data.slug);

        for(const slug of data.other) {
            if(slug.startsWith("/")) {
                res.revalidate(slug);
                continue;
            }
            switch (slug) {
                case "ALL":
                    
                    break;
                case "EVENTS":
            
                default:
                    break;
            }
        }

        return res.json({ revalidated: true });
    } catch (error: any) {

        console.error(error);

        return res.status(500).json({
            revalidated: false
        });
    }
}