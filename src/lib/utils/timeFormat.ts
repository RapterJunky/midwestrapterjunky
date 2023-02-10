const postDateTemplate = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
} satisfies Intl.DateTimeFormatOptions;

export const formatTime = (from: string, to: string): string => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (fromDate.getMonth() === toDate.getMonth()) {
    return `${
      fromDate.getMonth() + 1
    }/${fromDate.getDate()}-${toDate.getDate()}`;
  }

  return `${fromDate.getMonth() + 1}/${fromDate.getDate()}-${
    toDate.getMonth() + 1
  }/${toDate.getDate()}`;
};

/**
 * Formats a date string using the toLocalDateString method in format 'Monday, January 30, 2023'
 */
export const formatLocalDate = (date: string | null, locale?: string) => {
  const data = date ? new Date(date) : new Date();
  return data.toLocaleDateString(locale, postDateTemplate);
};
