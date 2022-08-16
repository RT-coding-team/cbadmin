/**
 * A model for an LMS course member
 */
export class CourseMember {
    /**
     * Build a course member
     *
     * @param {User}     user   The user details
     */
    constructor(user) {
        this.user = user;
        this.label = '';
        this._roles = [];
        this._buildLabel();
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
            this._roles.push(role);
            this._buildLabel();
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
        const has = this._roles.find((role) => role.id = converted);
        return (typeof has !== 'undefined');
    }

    /**
     * Build a label for displaying the member information
     */
    _buildLabel() {
        const roles = this._roles.map((role) =>  role.shortname);
        const roleText = (roles.length > 0) ? ` (${roles.join(', ')})` : '';
        this.label = `${this.user.fullname}${roleText}`;
    }

}
