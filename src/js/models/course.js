/**
 * A model for an LMS course
 */
export class Course {
    /**
     * Build the course
     *
     * @param {integer}     id          The id of the course
     * @param {string}      fullname    The full name of the course
     * @param {string}      shortname   The short name of the course
     * @param {string}      summary     The summary fo the course
     */
    constructor(id, fullname, shortname, summary) {
        this.id = parseInt(id, 10);
        this.fullname = fullname;
        this.shortname = shortname;
        this.summary = summary;
    }
}
