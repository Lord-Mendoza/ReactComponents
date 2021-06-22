export const isABoolean = (val) => {
    return typeof val === "boolean";
}

export const isNotABoolean = (val) => {
    return !isABoolean(val);
}