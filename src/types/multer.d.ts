import type { NextApiRequest, NextApiResponse } from "next";

export declare module "@types/multer" {
  interface Multer {
    single(
      fieldName: string
    ): (
      req: NextApiRequest,
      res: NextApiResponse,
      errCallback: (error: unknown) => void
    ) => void;
  }
}
