import {API_URL, del, get, post, put} from '../api/api';
import { Cohort } from '../models/cohort';
import { validateObjectValues } from '../utils/utils';

/**
* A class that stores and manages our LMS cohorts (classes in the UI).  This was designed to reduce the
* number of requests made to the API by storing the data locally.
 */
export class CohortsRepo {

    /**
     * Build the repository
     *
     * @param {string}      token       The API token
     * @param {UsersRepo}   usersRepo   The User's repository
     */
    constructor(token, usersRepo) {
        this.token = token;
        this.usersRepo = usersRepo;
        this.data = [];
    }

    /**
     * Add a new cohort (class)
     *
     * @param {string} name         The name of the cohort
     *
     * @return {Promise<Cohort>}    Returns the new cohort
     */
    add(name) {
        return this._load().then(() => {
            return new Promise((resolve, reject) => {
                const payload = { name };
                const errors = [
                    ...validateObjectValues(payload)
                ];
                if (errors.length > 0) {
                    reject({code: 0, errors});
                    return;
                }
                const success = (data) => {
                    if ((Array.isArray(data)) && ('id' in data[0])) {
                        const cohort = new Cohort(data[0].id, name);
                        this.data.push(cohort);
                        this._sortData();
                        resolve(cohort);
                        return;
                    }
                    reject({code: 0, errors: ['Something went wrong on the LMS server.']});
                    return;
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to create the new class.']});
                post(`${API_URL}lms/classes`, this.token, payload, success, error);
            });
        });
    }

    /**
     * Find all cohorts
     *
     * @return {Promise<array>}     The array of users
     */
    all() {
        return this._load();
    }

    /**
     * Delete the given cohort (class)
     *
     * @param  {integer}    id      The id of the cohort
     * @return {Promise<boolean>}   Was it deleted?
     */
    delete(id) {
        if (!id) {
            return Promise.resolve(false);
        }
        return this._load().then(() => {
            return new Promise((resolve, reject) => {
                const success = (data) => {
                    if ((typeof data === 'string') && (data.includes('deleted'))) {
                        this.data = this.data.filter((cohort) => cohort.id !== parseInt(id, 10));
                        resolve(true);
                        return;
                    }
                    reject({code: 200, errors: ['Something went wrong on the LMS server.']});
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to delete the class.']});
                del(`${API_URL}lms/classes/${id}`, this.token, success, error);
            });
        });
    }

    /**
     * Get a list of user's that belong to the cohort (class).
     *
     * @param  {integer}    id      The id of the cohort
     * @return {Promise<User>}      A list of Users
     */
    roster(id) {
        if (!id) {
            return Promise.reject({code: 200, errors: ['The class could not be found.']});
        }
        return this._load().then(() => {
            const currentIndex = this.data.findIndex((cohort) => (cohort.id === parseInt(id, 10)));
            if (currentIndex === -1) {
                return Promise.reject({code: 200, errors: ['The class could not be found.']});
            }
            if (this.data[currentIndex].studentsAdded) {
                return this.usersRepo.findByIds(this.data[currentIndex].enrolled());
            }
            return new Promise((resolve, reject) => {
                const success = (data) => {
                    if (data.length === 0) {
                        // We do not want to request the API again, but there are no students
                        this.data[currentIndex].studentsAdded = true;
                        resolve([]);
                        return;
                    }
                    data[0].userids.forEach((studentId) => this.data[currentIndex].enroll(studentId));
                    this.usersRepo.findByIds(this.data[currentIndex].enrolled()).then((students) => resolve(students));
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to retrieve the class roster.']});
                get(`${API_URL}lms/classes/${id}/users`, this.token, success, error);
            });
        });
    }

    /**
     * Update the given cohort (class)
     * @param  {integer}    id      The id of the cohort to update
     * @param  {string}     name    The new name for the cohort
     *
     * @return {Promise<Cohort>}    The updated cohort
     */
    update(id, name) {
        if (!id) {
            return Promise.resolve(null);
        }
        return this._load().then(() => {
            return new Promise((resolve, reject) => {
                const payload = { name };
                const errors = [
                    ...validateObjectValues(payload)
                ];
                if (errors.length > 0) {
                    reject({code: 0, errors});
                    return;
                }
                const success = (data) => {
                    if ((typeof data === 'string') && (data.includes('updated'))) {
                        this.data = this.data.filter((cohort) => cohort.id !== parseInt(id, 10));
                        const cohort = new Cohort(id, name);
                        this.data.push(cohort);
                        this._sortData();
                        resolve(cohort);
                        return;
                    }
                    reject({code: 0, errors: ['Something went wrong on the LMS server.']});
                    return;
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to update the class.']});
                put(`${API_URL}lms/classes/${id}`, this.token, payload, success, error);
            });
        });
    }

    /**
     * Load the cohorts data
     *
     * @return {Array} An array of all the cohorts
     */
    _load() {
        return new Promise((resolve, reject) => {
            if (this.data.length > 0) {
                resolve(this.data);
                return;
            }
            const success = (data) => {
                if (!Array.isArray(data)) {
                    console.error('No cohorts (classes) were found!', data);
                    reject([]);
                    return;
                }
                this.data = data.map(
                    (cohort) => new Cohort(cohort.id, cohort.name)
                );
                this._sortData();
                resolve(this.data);
            };
            const error = (code) => reject({code, errors: ['Unable to retrieve the classes from the API.']});
            get(`${API_URL}lms/classes`, this.token, success, error);
        });
    }

    /**
     * Sort this data by the name
     *
     * @return {void}
     */
    _sortData() {
        this.data.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    }
}
