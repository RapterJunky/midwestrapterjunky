import { NextApiRequest, NextApiResponse } from "next";

const handle = (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.method, req.body);

    return res.status(200).json({
        method: req.method,
        body: req.body
    })
}

export default handle;