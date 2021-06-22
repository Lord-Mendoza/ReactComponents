export const compareDates = (a, b) => {
    if ((a === null && b === null) || (a === undefined && b === undefined))
        return 1;
    else if (a === null || a === undefined)
        return -1;
    else if (b === null || b === undefined)
        return 1;
    else {
        const dateA = Date.parse(a);
        const dateB = Date.parse(b);

        if (dateA === dateB)
            return 0;
        return (dateA < dateB) ? -1 : 1;
    }
};