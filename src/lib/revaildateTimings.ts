export const REVAILDATE_IN_12H = 43200;
export const REVAILDATE_IN_2H = 7200;
export const REVALIDATE_IN_1H = 3600;
export const PUBLIC_CACHE_FOR_2H = `public, max-age=${REVAILDATE_IN_2H}, immutable`;
export const PUBLIC_CACHE_FOR_1H = `public max-age=${REVALIDATE_IN_1H}, immutable`;
