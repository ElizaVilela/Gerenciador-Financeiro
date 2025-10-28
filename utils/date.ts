
export const getYearMonth = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
};

export const getFirstDayOfCurrentMonth = (): Date => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
};

export const dateToYearMonthDay = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
