import {API_URL, del, get, post, put} from '../api/api';
import { User } from '../models/user';
import {
    validateLMSEmail, validateLMSPassword, validateLMSUsername, validateObjectValues
} from '../utils/utils';

/**
 * A class that stores and manages our LMS users.  This was designed to reduce the
 * number of requests made to the API by storing the data locally.
 */
export class UsersRepo {

    /**
     * Build the repository
     *
     * @param {string} token  The API token
     */
    constructor(token) {
        this.token = token;
        this.data = [];
    }

    /**
     * Add a new user to the LMS
     *
     * @param {string} email      The user's email
     * @param {string} firstname  The user's firstname
     * @param {string} lastname   The user's last name
     * @param {string} password   The user's password
     * @param {string} username   The user's username
     *
     * @return {Promise}          Returns the new user
     */
    add(email, firstname, lastname, password, username) {
        return this._load().then(() => {
            return new Promise((resolve, reject) => {
                const payload = { username, firstname, lastname, email, password };
                const errors = [
                    ...validateObjectValues(payload),
                    ...validateLMSPassword(password),
                    ...validateLMSUsername(username),
                    ...validateLMSEmail(email)
                ];
                if (errors.length > 0) {
                    reject({code: 0, errors});
                    return;
                }
                const success = (data) => {
                    if ((Array.isArray(data)) && ('id' in data[0])) {
                        const user = new User(data[0].id, email, firstname, `${firstname} ${lastname}`, lastname, username);
                        this.data.push(user);
                        this._sortData();
                        resolve(user);
                        return;
                    } else if ((typeof data === 'object') && ('debuginfo' in data)) {
                        reject({code: 0, errors: [data.debuginfo]});
                        return;
                    }
                    reject({code: 0, errors: ['Something went wrong on the LMS server.']});
                    return;
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to create the new user.']});
                post(`${API_URL}lms/users`, this.token, payload, success, error);
            });
        });
    }

    /**
     * get all the users
     *
     * @return {Promise} An array of all the users
     */
    all() {
        return this._load();
    }

    /**
     * Delete the specific user from the LMS
     *
     * @param  {integer}    id  The id of the user to delete
     *
     * @return {Promise}        Did it successfuly delete?
     */
    delete(id) {
        if (!id) {
            return Promise.resolve(false);
        }
        return this._load().then(() => {
            return new Promise((resolve, reject) => {
                const success = (data) => {
                    if ((typeof data === 'string') && (data.includes('deleted'))) {
                        this.data = this.data.filter((user) => user.id !== parseInt(id, 10));
                        resolve(true);
                    } else {
                        reject({code: 200, errors: ['Something went wrong on the LMS server.']});
                    }
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to delete the user.']});
                del(`${API_URL}lms/users/${id}`, this.token, success, error);
            });
        });
    }

    /**
     * Find by id
     *
     * @param  {integer}    id  The id of the user
     *
     * @return {Promise}        The user with the given id.
     */
    find(id) {
        if (!id) {
            return Promise.resolve(null);
        }
        return this._load().then(
            (users) => users.find((user) => user.id === parseInt(id, 10))
        );
    }

    /**
     * Find the users by an array of ids.
     *
     * @param  {Array} ids  An array of ids
     *
     * @return {Array}      An array of users
     */
    findByIds(ids) {
        if (ids.length === 0) {
            return Promise.resolve([]);
        }
        const converted = ids.map((id) => parseInt(id, 10));
        return this._load().then(
            (users) => users.filter((user) => converted.includes(user.id))
        );
    }

    /**
     * Update the LMS user
     *
     * @param {string} id         The user's id
     * @param {string} email      The user's email
     * @param {string} firstname  The user's firstname
     * @param {string} lastname   The user's last name
     * @param {string} password   The user's password (set to '' if you do not want to change)
     * @param {string} username   The user's username
     *
     * @return {Promise}          Returns the updated user
     */
    update(id, email, firstname, lastname, password, username) {
        if (!id) {
            return Promise.resolve(null);
        }
        return this._load().then(() => {
            return new Promise((resolve, reject) => {
                const payload = { username, firstname, lastname, email };
                let errors = [];
                if (password !== '') {
                    payload.password = password;
                    errors = [
                        ...validateObjectValues(payload),
                        ...validateLMSPassword(password),
                        ...validateLMSUsername(username),
                        ...validateLMSEmail(email),
                    ];
                } else {
                    errors = [
                        ...validateObjectValues(payload),
                        ...validateLMSUsername(username),
                        ...validateLMSEmail(email)
                    ];
                }
                if (errors.length > 0) {
                    reject({code: 0, errors});
                    return;
                }
                const success = (data) => {
                    if ((typeof data === 'string') && (data.includes('updated'))) {
                        this.data = this.data.filter((user) => user.id !== parseInt(id, 10));
                        const user = new User(id, email, firstname, `${firstname} ${lastname}`, lastname, username);
                        this.data.push(user);
                        this._sortData();
                        resolve(user);
                        return;
                    } else if ((typeof data === 'object') && ('debuginfo' in data)) {
                        reject({code: 0, errors: [data.debuginfo]});
                        return;
                    }
                    reject({code: 0, errors: ['Something went wrong on the LMS server.']});
                    return;

                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to update the user.']});
                put(`${API_URL}lms/users/${id}`, this.token, payload, success, error);
            });
        });
    }

    /**
     * Load the user data
     *
     * @return {Array} An array of all the users
     */
    _load() {
        return new Promise((resolve, reject) => {
            if (this.data.length > 0) {
                resolve(this.data);
                return;
            }
            const success = (data) => {
                if (!('users' in data)) {
                    console.error('No users were found!', data);
                    reject([]);
                    return;
                }
                this.data = data.users.map(
                    (user) => new User(user.id, user.email, user.firstname, user.fullname, user.lastname, user.username)
                );
                this._sortData();
                resolve(this.data);
            };
            const error = (code) => reject({code, errors: ['Unable to retrieve the users from the API.']});
            get(`${API_URL}lms/users`, this.token, success, error);
        });
    }

    /**
     * Sort this data by the fullname
     *
     * @return {void}
     */
    _sortData() {
        this.data.sort((a,b) => (a.fullname > b.fullname) ? 1 : ((b.fullname > a.fullname) ? -1 : 0));
    }
}
