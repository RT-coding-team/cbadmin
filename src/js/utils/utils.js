/**
 * Various useful utlity functions
 */
/**
 * Sort an array of objects alphabetically using a key of the object
 *
 * @param  {string} key The key to sort by
 * @return {integer}    The sort result
 */
export const alphaSortWithKey = (key) => {
    return (a, b) =>  {
        const la = a[key].toLowerCase();
        const lb = b[key].toLowerCase();
        if (la < lb) {
            return -1;
        }
        if (la > lb) {
            return 1;
        }
        return 0;
    }
}

/**
 * Append the options to a selector
 *
 * @param  {object} selector    The selector to append options to
 * @param  {string} values      The array of value objects to append
 * @param  {string} textKey     The key for the text of the option
 * @param  {string} valueKey    The key for the value option
 * @return {void}
 */
export const appendOptionsToSelect = (selector, values, textKey, valueKey) => {
    clearSelector(selector);
    values
        .sort(alphaSortWithKey(textKey))
        .forEach((val) =>  {
            const option = document.createElement('option');
            option.text = val[textKey];
            option.value = val[valueKey];
            selector.appendChild(option);
        });
}

/**
 * Clear the selector of all options but the first.
 *
 * @param  {object} selector    The selector you want to clear
 * @return {void}
 */
export const clearSelector = (selector) => {
    const options = selector.querySelectorAll('option');
    options.forEach((option, i)    =>  {
        if (i > 0) {
            option.remove();
        }
    });
}
/**
 * Validates the password based on the LMS requirements
 *
 * @param  {string} password    The password to validate
 * @return {array}              An array of errors. It is empty if the password validates.
 */
export const validateLMSPassword = (password) => {
    const errors = [];
    const specials = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    // At least 8 characters
    if (password.length < 8) {
        errors.push('You need to supply at least 8 characters.');
    }
    // At least 1 digit
    if (!/[0-9]/.test(password)) {
        errors.push('You need to supply at least 1 number.');
    }
    // At least 1 lowercase
    if (!/[a-z]/.test(password)) {
        errors.push('You need to supply at least 1 lowercase letter.');
    }
    // At least 1 uppercase
    if (!/[A-Z]/.test(password)) {
        errors.push('You need to supply at least 1 uppercase letter.');
    }
    // At least 1 non-alphanumeric symbol (ex. *, -, or #)
    if (!specials.test(password)) {
        errors.push('You need to supply at least 1 special character. (ex. *, -, or #)');
    }
    return errors;
}
