export const isNotAnEmptyArray = (val) => {
    return Array.isArray(val) && val.length > 0;
}

export const isAnEmptyArray = (val) => {
    return !isNotAnEmptyArray(val);
}