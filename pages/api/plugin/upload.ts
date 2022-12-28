import type { NextApiRequest, NextApiResponse } from "next";
import { buildClient, ApiError } from '@datocms/cma-client-node';
import { tmpdir } from 'os';
import { join } from "path";
import { unlink } from 'fs/promises';
import { cwebp } from '@ezy/webp';
import multer from 'multer';
import createHttpError from "http-errors";
import { logger } from "../../../lib/logger";

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

export const config = {
    api: {
      bodyParser: false, // Disallow body parsing, consume as stream
    },
  };

const upload = multer({
    storage: multer.diskStorage({
      destination: tmpdir(),
      filename: (req, file, cb) => cb(null, file.originalname),
    }),
});

export default async function handle(req: NextApiRequest & FileUpload, res: NextApiResponse) {
    try {
        if(req.method !== "POST" || !req.headers["content-type"]?.includes("multipart/form-data")) throw createHttpError.BadRequest();
        if(!req.headers.authorization || req.headers.authorization.replace("Bearer ","") !== process.env.PLUGIN_TOKEN || !req.headers["x-dato-user"]) throw createHttpError.Unauthorized();

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
            filepath =  join(tmpdir(),filename);
            await cwebp(req.file.path,filepath);  
            await unlink(req.file.path);
        }   

        const client = buildClient({ 
            environment: process.env.DATOCMS_ENVIRONMENT, 
            apiToken: req.headers["x-dato-user"] as string
        });

        const data = await client.uploads.createFromLocalFile({
            localPath: filepath,
            filename: filename,
            skipCreationIfAlreadyExists: true,
        });

        await unlink(filepath);

        return res.status(202).json(data);
    } catch (error) {   
        if(createHttpError.isHttpError(error)) {
            logger.error(error,error.message);
            return res.status(error.statusCode).json(error);
        }

        if(error instanceof multer.MulterError) {
            const ie = createHttpError.InternalServerError();
            logger.error(error,error.message);
            return res.status(ie.statusCode).json(ie);
        }

        if(error instanceof ApiError) {
            logger.error(error, error?.humanMessage ?? error.message);
            return res.status(error.response.status).json({  message: error.humanMessage ?? error.response.statusText });
        }

        const ie = createHttpError.InternalServerError();
        logger.error(error,ie.message);
        return res.status(ie.statusCode).json(ie);
    }
}