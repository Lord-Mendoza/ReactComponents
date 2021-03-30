export const isNotAnEmptyObject = (val) => {
    return val !== undefined && val !== null
        && typeof val === "object" && Object.keys(val).length > 0;
}

export const isAnEmptyObject = (val) => {
    return !isNotAnEmptyObject(val);
}

export const isSameObject = (objOne, objTwo) => {
    if (isNotAnEmptyObject(objOne) && isNotAnEmptyObject(objTwo))
        return JSON.stringify(objOne, Object.keys(objOne).sort()) === JSON.stringify(objTwo, Object.keys(objTwo).sort())
    else if (isAnEmptyObject(objOne) && isAnEmptyObject(objTwo))
        return false;
    else if (isAnEmptyObject(objOne) && isNotAnEmptyObject(objTwo))
        return false;
    else if (isNotAnEmptyObject(objOne) && isAnEmptyObject(objTwo))
        return false;
    else
        return null;
}

export const isNotSameObject = (objOne, objTwo) => {
    let isSameObjectResults = isSameObject(objOne, objTwo);
    if (typeof isSameObjectResults === "boolean")
        return !isSameObjectResults;
    else
        return null;
}

export const isNotNullNorUndefined = (val) => {
    return val !== null && val !== undefined;
}

export const isNullOrUndefined = (val) => {
    return !isNotNullNorUndefined(val);
}