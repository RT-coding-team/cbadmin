/**
 * A model for an LMS course
 */
export class Course {
    constructor(id, displayname, fullname, shortname, summary) {
        this.id = parseInt(id, 10);
        this.displayname = displayname;
        this.fullname = fullname;
        this.shortname = shortname;
        this.summary = summary;
    }
}
