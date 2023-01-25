const postDateTemplate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } satisfies Intl.DateTimeFormatOptions;
export const formatLocalDate = (date: string | null, locale: string = "en-us") => {
    const data = date ? new Date(date) : new Date();
    return data.toLocaleDateString(locale,postDateTemplate);
}