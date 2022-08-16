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
        this.studentsAdded = false;
        this._studentIds = [];
    }

    /**
     * Enroll a student in the class
     *
     * @param {integer} id  The student id
     */
    enroll(id) {
        if (!this.isEnrolled(id)) {
            this.studentsAdded = true;
            this._studentIds.push(parseInt(id, 10));
        }
    }

    /**
     * Get the student ids
     *
     * @return {Array} The ids of the user
     */
    enrolled() {
        return this._studentIds;
    }

    /**
     * is the student enrolled?
     *
     * @param {integer} id  The student id
     *
     * @return {Boolean}    Yes|No
     */
    isEnrolled(id) {
        const converted = parseInt(id, 10);
        return (this._studentIds.includes(converted));
    }

    /**
     * Unenroll a student in a class
     *
     * @param {integer} id  The student id
     */
    unenroll(id) {
        const converted = parseInt(id, 10);
        if (!this.isEnrolled(converted)) {
            return;
        }
        const index = this._studentIds.indexOf(converted);
        if (index > -1) {
            this._studentIds.splice(index, 1);
        }
    }
}
