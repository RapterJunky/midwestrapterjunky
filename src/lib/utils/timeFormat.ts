export const formatTime = (from: string, to: string): string => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (fromDate.getMonth() === toDate.getMonth()) {
    return `${fromDate.getMonth() + 1
      }/${fromDate.getDate()}-${toDate.getDate()}`;
  }

  return `${fromDate.getMonth() + 1}/${fromDate.getDate()}-${toDate.getMonth() + 1
    }/${toDate.getDate()}`;
};

/**
 * Formats a date string using the toLocalDateString method in format 'Monday, January 30, 2023'
 */
export const formatLocalDate = (
  date: Date | string | null,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
) => {
  const data = date
    ? typeof date === "string"
      ? new Date(date)
      : date
    : new Date();
  return data.toLocaleDateString(locale, {
    weekday: options?.weekday,
    year: options?.year,
    month: options?.month,
    day: options?.day,
  });
};
