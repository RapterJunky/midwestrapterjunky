import { cache } from "react";
import "server-only";

import { REVAILDATE_IN_2H } from "@lib/revaildateTimings";

export const revalidate = REVAILDATE_IN_2H;

const getVenders = cache(() => {

    return [{
        name: "Midwest",
        value: "midwest",
        query: "vendor"
    }];
});

export default getVenders;