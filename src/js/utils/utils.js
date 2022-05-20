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
