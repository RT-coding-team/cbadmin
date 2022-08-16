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
        this.membersAdded = false;
        this._members = [];
    }

    /**
     * enroll a member into the course
     *
     * @param  {CourseMember}   member  The member to add
     */
    enroll(member) {
        if (!this.isEnrolled(member.user.id)) {
            this.membersAdded = true;
            this._members.push(member);
        }
    }

    /**
     * Get a list of enrolled members
     *
     * @return {Array<CourseMember>} An array of course members
     */
    enrolled() {
        return this._members;
    }

    /**
     * Is the member enrolled?
     *
     * @param  {integer}    id  The id of the member
     * @return {Boolean}        yes|no
     */
    isEnrolled(id) {
        const converted = parseInt(id, 10);
        const member = this._members.find((member) => member.user.id === converted);
        return (typeof member !== 'undefined');
    }

    /**
     * Unenroll the member
     *
     * @param  {integer}    id  The id of the member
     */
    unenroll(id) {
        const converted = parseInt(id, 10);
        this._members = this._members.filter((member) => member.user.id !== converted);
    }

}
