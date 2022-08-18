/**
 * A model for an LMS course memberships.
 */
export class CourseMembership {

    /**
     * Build the model
     *
     * @param {integer} courseId    The course id
     * @param {integer} memberId    The id of the member
     * @param {string}  memberType  The type of member
     */
    constructor(courseId, memberId, memberType) {
        this.courseId = parseInt(courseId, 10);
        this.memberId = parseInt(memberId, 10);
        this.memberType = memberType;
        // We attach a copy of the member in the repo, but do not store in our cache
        this.member = null;
        this.roles = [];
    }

    /**
     * add a role to the member
     *
     * @param {integer}     roleId      The role id
     * @param {string}      shortname   The short name for the role
     */
    addRole(roleId, shortname) {
        const role = {
            id: parseInt(roleId, 10),
            shortname: shortname
        };
        if (!this.hasRole(roleId)) {
            this.roles.push(role);
        }
    }

    /**
     * Does the member have that role?
     *
     * @param {integer}     roleId      The role id
     *
     * @return {Boolean}                Yes|no
     */
    hasRole(roleId) {
        const converted = parseInt(roleId, 10);
        const has = this.roles.find((role) => role.id = converted);
        return (typeof has !== 'undefined');
    }

    /**
     * Get the role label for displaying the member information
     */
    getRoleLabel() {
        const roles = this.roles.map((role) =>  role.shortname);
        return (roles.length > 0) ? ` (${roles.join(', ')})` : '';
    }

}
