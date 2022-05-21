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
 * Append the list items to the list
 *
 * @param  {object} list        The list to append to
 * @param  {array}  values      An array of objects with the text for each item
 * @param  {string} textKey     The key for which value to use for the text of the item
 * @return {void}
 */
export const appendItemsToList = (list, values, textKey) => {
    list.innerHTML = '';
    values
        .sort(alphaSortWithKey(textKey))
        .forEach((val) =>  {
            const li = document.createElement('li');
            li.innerHTML = `${val[textKey]}`;
            list.appendChild(li);
        });
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
 * Validates the email based on the LMS requirements
 *
 * @param  {string} email   The email to validate
 * @return {array}          An array of errors. It is empty then it validates.
 *
 * @link https://stackoverflow.com/a/9204568/4638563
 */
export const validateLMSEmail = (email) => {
    const errors = [];
    if (!/\S+@\S+\.\S+/.test(email)) {
        errors.push('You must provide a valid email address.');
    }
    return errors;
}

/**
 * Validates the password based on the LMS requirements
 *
 * @param  {string} password    The password to validate
 * @return {array}              An array of errors. It is empty then it validates.
 */
export const validateLMSPassword = (password) => {
    const errors = [];
    const specials = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    // At least 8 characters
    if (password.length < 8) {
        errors.push('You\'re password must be at least 8 characters.');
    }
    // At least 1 digit
    if (!/[0-9]/.test(password)) {
        errors.push('You\'re password must have at least 1 number.');
    }
    // At least 1 lowercase
    if (!/[a-z]/.test(password)) {
        errors.push('You\'re password must have at least 1 lowercase letter.');
    }
    // At least 1 uppercase
    if (!/[A-Z]/.test(password)) {
        errors.push('You\'re password must have at least 1 uppercase letter.');
    }
    // At least 1 non-alphanumeric symbol (ex. *, -, or #)
    if (!specials.test(password)) {
        errors.push('You\'re password must have at least 1 special character. (ex. *, -, or #)');
    }
    return errors;
}

/**
 * Validate the LMS username
 *
 * @param  {string} username    The username to validate
 * @return {array}              An array of errors. It is empty then it validates.
 */
export const validateLMSUsername = (username) => {
    const errors = [];
    const specialBlacklist = /[!#$%^&*()+=\[\]{};':"\\|,<>\/?]+/;
    //It cannot contain uppercase letters
    if (/[A-Z]/.test(username)) {
        errors.push('You\'re username cannot contain uppercase letters.');
    }
    if (specialBlacklist.test(username)) {
        errors.push('You\'re username can only contain these special characters: hypen \'-\', underscore \'_\', period \'.\', or at-sign \'@\'');
    }
    return errors;
}

/**
 * Validate an objects values are not empty.
 *
 * @param  {object} obj The object to iterate
 * @return {array}      An array of errors. It is empty then it validates.
 */
export const validateObjectValues = (obj) => {
    const errors = [];
    for (const key in obj) {
        if (obj[key] === '') {
            errors.push(`You must supply a valid ${key}!`);
        }
    }
    return errors;
}
