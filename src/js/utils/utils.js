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
