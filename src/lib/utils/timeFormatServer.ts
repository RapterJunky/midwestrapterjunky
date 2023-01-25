import moment from 'moment';

export const formatTime = (from: string, to: string): string => {
    let mouth = 0;

    const fromDate = moment(from);
    const toDate = moment(to);

    if(fromDate.month() === toDate.month()) {
        mouth = fromDate.month();
    }

    return `${mouth+1}/${fromDate.date()}-${toDate.date()}`;
}

export const formatTimeUser = (date: string) => {
    return moment(date).format("MMM DD YYYY - h:mmA");
}

export const formatUserDate = (date: string) => {
    return moment(date).format("MMM DD YYYY");
}

export const formatDateArticle = (date: string) => {
    return moment(date).format("MMMM DD, YYYY");
}