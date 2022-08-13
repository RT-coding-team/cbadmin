/**
 * A model for an LMS user
 */
export class User {
    constructor(id, email, firstname, fullname, lastname, username) {
        this.id = id;
        this.email = email;
        this.firstname = firstname;
        this.fullname = fullname;
        this.lastname = lastname;
        this.username = username;
    }
}
