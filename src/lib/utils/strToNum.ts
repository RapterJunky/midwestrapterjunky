import { z } from 'zod';

export const strToNum = (arg: string, ctx: z.RefinementCtx) => {
    const parsed = parseInt(arg);
    if (isNaN(parsed)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Not a number",
        });
        return z.NEVER;
    }
    return parsed;
}

