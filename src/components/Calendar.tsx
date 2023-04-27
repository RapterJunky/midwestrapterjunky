import { useState, useMemo } from "react";
import Link from "next/link";

import HiChevronRight from "@components/icons/HiChevronRight";
import HiChevronLeft from "@components/icons/HiChevronLeft";

interface CalenderProps {
  data: {
    id: string;
    slug: string;
    title: string;
    dateFrom: string;
    dateTo: string;
  }[];
}

const mouthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * @author mithicher
 * @see https://tailwindcomponents.com/u/mithicher
 * @see https://tailwindcomponents.com/component/calendar-ui-with-tailwindcss-and-alpinejs
 *
 */
const Calendar: React.FC<CalenderProps> = (props) => {
  const today = useMemo(() => {
    const data = new Date();
    return {
      date: data.getDate(),
      year: data.getFullYear(),
      month: data.getMonth(),
    };
  }, []);
  const [current, setCurrent] = useState(today);

  const offsets = useMemo(() => {
    const date = new Date(current.year, current.month + 1, 0);
    const daysInMonth = date.getDate();
    date.setDate(1);

    let offset = date.getDay();
    if (offset === 7) offset = 0;

    let offsetEnd = 7 - ((offset + daysInMonth) % 7);
    if (offsetEnd === 7) offsetEnd = 0;

    return {
      start: offset,
      end: offsetEnd,
      days_in_month: daysInMonth,
      name: mouthNames[date.getMonth()],
      days_last_month: new Date(
        current.year,
        (current.month === 0 ? 11 : current.month - 1) + 1,
        0
      ).getDate(),
    };
  }, [current]);

  const vaildEvents = (
    value: {
      id: string;
      slug: string;
      title: string;
      dateFrom: string;
      dateTo: string;
    },
    day: number
  ) => {
    const start = new Date(value.dateFrom);
    const end = new Date(value.dateTo);
    const date = new Date(current.year, current.month, day);
    return date >= start && date <= end;
  };

  const isToday = (day: number, offsetMonth = 0): boolean => {
    let month = current.month + offsetMonth;
    if (month > 11) month = 0;
    else if (month < 0) month = 11;
    return (
      today.date === day && today.month === month && today.year === current.year
    );
  };

  const nextMouth = () => {
    setCurrent((data) => {
      let year = data.year;
      let nextMouth = data.month + 1;
      if (nextMouth > 11) {
        nextMouth = 0;
        year++;
      }

      return { ...data, month: nextMouth, year };
    });
  };
  const prevMouth = () => {
    setCurrent((data) => {
      let year = data.year;
      let nextMouth = data.month - 1;
      if (nextMouth < 0) {
        nextMouth = 11;
        year--;
      }

      return { ...data, month: nextMouth, year };
    });
  };

  return (
    <div className="sans-serif flex h-full flex-grow flex-col bg-gray-100 antialiased">
      <div className="mx-auto h-full px-2 py-2 md:container md:px-4 md:py-24">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between px-6 py-2">
            <div>
              <span className="text-lg font-bold text-gray-800">
                {offsets.name}
              </span>
              <span className="ml-1 text-lg font-normal text-gray-600">
                {current.year}
              </span>
            </div>
            <div className="rounded-lg border px-1 pt-0.5">
              <button
                role="button"
                aria-label="Previous Month"
                onClick={prevMouth}
                type="button"
                className="inline-flex cursor-pointer items-center rounded-lg p-1 leading-none transition duration-100 ease-in-out hover:bg-gray-200"
              >
                <HiChevronLeft className="inline-flex h-6 w-6 leading-none text-gray-500" />
              </button>
              <div className="inline-flex h-6 border-r"></div>
              <button
                role="button"
                aria-label="Next Month"
                onClick={nextMouth}
                type="button"
                className="inline-flex cursor-pointer items-center rounded-lg p-1 leading-none transition duration-100 ease-in-out hover:bg-gray-200"
              >
                <HiChevronRight className="inline-flex h-6 w-6 leading-none text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
              <div key={i} className="w-1/7 px-2 py-2">
                <div className="text-center text-sm font-bold uppercase tracking-wide text-gray-600">
                  {day}
                </div>
              </div>
            ))}
          </div>

          <div className="-mx-1 -mb-1">
            <div className="flex flex-wrap border-l border-t">
              {Array.from(
                { length: offsets.start },
                (_, i) => offsets.days_last_month - i
              )
                .reverse()
                .map((day) => (
                  <div
                    key={day}
                    className="relative h-30 w-1/7 border-b border-r bg-slate-100 px-4 pt-2"
                  >
                    <div
                      className={`inline-flex h-6 w-6 select-none items-center justify-center rounded-full text-center leading-none text-gray-400 transition duration-100 ease-in-out ${isToday(day, -1) ? "bg-gray-500 text-white" : ""
                        }`}
                    >
                      {day}
                    </div>
                  </div>
                ))}
              {Array.from(
                { length: offsets.days_in_month },
                (_, k) => k + 1
              ).map((day, i) => (
                <div
                  key={i}
                  className="relative h-30 w-1/7 border-b border-r px-4 pt-2"
                >
                  <div
                    className={`inline-flex h-6 w-6 cursor-pointer select-none items-center justify-center rounded-full text-center leading-none transition duration-100 ease-in-out ${isToday(day)
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-blue-200"
                      }`}
                  >
                    {day}
                  </div>
                  <div
                    style={{ height: "80px" }}
                    className="mt-1 overflow-y-auto"
                  >
                    {props.data
                      .filter((value) => vaildEvents(value, day))
                      .map((event, i) => (
                        <Link
                          href={{
                            pathname: "/events/[id]",
                            query: { id: event.slug },
                          }}
                          key={i}
                          className="mt-1 block overflow-hidden rounded-lg border border-red-200 bg-red-100 px-2 py-1 text-red-800"
                        >
                          <p className="truncate text-sm leading-tight">
                            {event.title}
                          </p>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
              {Array.from({ length: offsets.end }).map((_, i) => (
                <div
                  key={i}
                  className="h-30 w-1/7 border-b border-r bg-slate-100 px-4 pt-2"
                >
                  <div
                    className={`inline-flex h-6 w-6 select-none items-center justify-center rounded-full text-center leading-none text-gray-400 transition duration-100 ease-in-out ${isToday(i + 1, 1) ? "bg-gray-500 text-white" : ""
                      }`}
                  >
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
