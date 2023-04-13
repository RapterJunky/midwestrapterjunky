import { useCallback } from 'react';

const second = 1e3;
const minute = 6e4;
const hour = 36e5;
const day = 864e5;
const threshold = {
    month: 2,  // at least 2 months before using year.
    day: 6, // at least 6 days before using month.
    hour: 6, // at least 6 hours before using day.
    minute: 59, // at least 59 minutes before using hour.
    second: 59 // at least 59 seconds before using minute.
}

const tranformer = new Intl.RelativeTimeFormat(undefined);

const startOf = (date: Date, unit: "year" | "month" | "day" | "hour" | "minute" | "second") => {
    const copy = new Date(date.getTime());

    switch (unit) {
        case "year":
            copy.setMonth(0);
        case "month":
            copy.setDate(1);
        case "day":
            copy.setHours(0);
        case "hour":
            copy.setMinutes(0);
        case "minute":
            date.setSeconds(0);
        case "second":
            date.setMilliseconds(0);
    }
    return copy;
}

/**
    @see https://github.com/rxaviers/relative-time/blob/master/src/relative-time.js 
**/
const useRelativeTime = () => {
    const formatter = useCallback((time: string | Date) => {
        if (!(time instanceof Date)) time = new Date(time);
        const now = new Date();
        const diff: { ms: number; years: number; months?: number; days?: number; hours?: number; minutes?: number; seconds?: number; } = {
            ms: time.getTime() - now.getTime(),
            years: (time.getFullYear() - now.getFullYear()),
        };
        const round = Math[diff.ms > 0 ? "floor" : "ceil"];

        diff.months = Math.abs(diff.years * 12 + (time.getMonth() - now.getMonth()));
        diff.days = Math.abs(round((+startOf(time, "day") - +startOf(now, "day")) / day));
        diff.hours = Math.abs(round((+startOf(time, "hour") - +startOf(now, "hour")) / hour));
        diff.minutes = Math.abs(round((+startOf(time, "minute") - +startOf(now, "minute")) / minute));
        diff.seconds = Math.abs(round((+startOf(time, "second") - +startOf(now, "second")) / second));
        diff.years = Math.abs(diff.years);

        let offset: number;
        let unit: Intl.RelativeTimeFormatUnit;
        switch (true) {
            case diff.years > 0 && diff.months > threshold.month:
                unit = "years";
                offset = diff.years;
                break;
            case diff.months > 0 && diff.days > threshold.day:
                unit = "months";
                offset = diff.months;
                break;
            case diff.days > 0 && diff.hours > threshold.hour:
                unit = "days";
                offset = diff.days;
                break;
            case diff.hours > 0 && diff.minutes > threshold.minute:
                unit = "hours";
                offset = diff.hours;
                break;
            case diff.minutes > 0 && diff.seconds > threshold.second:
                unit = "minutes";
                offset = diff.minutes;
                break;
            default:
                unit = "seconds";
                offset = diff.seconds;
                break;
        }

        return tranformer.format(-offset, unit);
    }, []);
    return formatter;
}

export default useRelativeTime;