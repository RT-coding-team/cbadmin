/**
 * A model for an LMS cohort (class in UI)
 */
export class Cohort {
    /**
     * Build the model
     *
     * @param {integer}     id    The cohort id
     * @param {string}      name  The cohort name
     */
    constructor(id, name) {
        this.id = parseInt(id, 10);
        this.name = name;
    }
}
