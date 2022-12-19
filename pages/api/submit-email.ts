import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
import prisma from "../../lib/prisma";

const defaultResponse = "The Server was unable to add the email to the mailing list.";
const emailValidator = z.object({
    email: z.string().email()
});

//https://stackoverflow.com/questions/72924162/next-js-error-405-method-not-allowed-on-redirect-after-form-submission-post
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if(req.method !== "POST") return res.redirect(301,"/");

        const body = emailValidator.parse(req.body);

        await prisma.mailingList.create({
            data: {
                email: body.email
            }
        });
   
        return res.redirect(301,'/submit?ok=true');
    } catch (error: any) {
        if(error instanceof ZodError) {
            const status = fromZodError(error);
            console.error(status);
            return res.redirect(301,`/submit?ok=false&error=${encodeURIComponent(status.message)}`);
        }
        console.error(error);

        if(error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case "P2002":
                    return res.redirect(301,`/submit?ok=false&error=${encodeURIComponent(`${req.body.email} has already been added to the mailing list.`)}`);
                default:
                    return res.redirect(301,`/submit?ok=false&error=${encodeURIComponent(defaultResponse)}`);
            }


        }

        return res.redirect(301,`/submit?ok=false&error=${encodeURIComponent(defaultResponse)}`);
    }
}