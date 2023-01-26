import type { NextApiRequest, NextApiResponse } from "next";
import { tmpdir } from 'os';
import { join } from "path";
import { unlink, readFile } from 'fs/promises';
import { cwebp } from '@lib/webp';
import multer from 'multer';
import createHttpError from "http-errors";
import { logger } from "@lib/logger";

interface FileUpload {
    file: {
        fieldname: string;
        filename: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        destination: string;
        path: string;
        size: number;
    }
}

const tmp = tmpdir();

const upload = multer({
    storage: multer.diskStorage({
      destination: tmp,
      filename: (req, file, cb) => cb(null, file.originalname),
    }),
});

export const config = {
    api: {
      bodyParser: false, // Disallow body parsing, consume as stream
    },
};

export default async function handle(req: NextApiRequest & FileUpload, res: NextApiResponse) {
    try {
        if(req.method !== "POST" || !req.headers["content-type"]?.includes("multipart/form-data")) throw createHttpError.BadRequest();
        if(!req.headers.authorization || req.headers.authorization.replace("Bearer ","") !== process.env.PLUGIN_TOKEN) throw createHttpError.Unauthorized();

        await new Promise<void>((ok,rej)=>{
            upload.single("image")(req as any,res as any,(err: any)=>{
                if(err) return rej(err);
                return ok();
            });
        });

        logger.info(req.file,`${req.file.mimetype} | ${req.file.originalname}`);

        let filename = req.file.filename;
        let filepath = req.file.path;

        if(req.file.mimetype !== "image/webp") {
            filename = filename.replace(/(\..+)$/g,".webp");
            filepath =  join(tmp,filename);
            await cwebp(req.file.path,filepath);  
            await unlink(req.file.path);
        }   

        const file = await readFile(filepath, { encoding: "base64" });

        await unlink(filepath);

        return res.status(200).json({
            base64: `data:image/webp;base64,${file}`,
            filename: filename
        });
    } catch (error) {   
        if(createHttpError.isHttpError(error)) {
            logger.error(error,error.message);
            return res.status(error.statusCode).json(error);
        }

        const ie = createHttpError.InternalServerError();

        if(error instanceof multer.MulterError) {
            logger.error(error,error.message);
            return res.status(ie.statusCode).json(ie);
        }

        logger.error(error,ie.message);
        return res.status(ie.statusCode).json(ie);
    }
}