function toPositiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
}

function normalizeRequiredString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function toNonNegativeNumber(value) {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
}

function isOneOf(value, allowedValues) {
    return allowedValues.includes(value);
}

module.exports = {
    toPositiveInteger,
    normalizeRequiredString,
    toNonNegativeNumber,
    isOneOf
};
