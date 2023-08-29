import { cache } from "react";
import "server-only";

import { REVAILDATE_IN_2H } from "../revaildateTimings";


export const revalidate = REVAILDATE_IN_2H;

// eslint-disable-next-line @typescript-eslint/require-await
const getVenders = cache(async () => {

    return [{
        name: "Midwest",
        value: "midwest",
        query: "vendor"
    }];
});

export default getVenders;