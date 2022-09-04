import {API_URL, del, get, post, put} from '../api/api';
import { Course } from '../models/course';
import { User } from '../models/user';
import { validateObjectValues } from '../utils/utils';

/**
* A class that stores and manages our LMS courses.  This was designed to reduce the
* number of requests made to the API by storing the data locally.
 */
export class CoursesRepo {

    /**
     * Build the repository
     *
     * @param {string}      token       The API token
     */
    constructor(token) {
        this.token = token;
        this.data = [];
    }

    /**
     * get all the courses
     *
     * @return {Promise} An array of all the courses
     */
    all() {
        return this._load();
    }

    /**
     * Delete a course
     *
     * @param  {integer}    id  The id of the course to delete
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
                        this.data = this.data.filter((course) => course.id !== parseInt(id, 10));
                        resolve(true);
                        return;
                    }
                    reject({code: 200, errors: ['Something went wrong on the LMS server.']});
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to delete the course.']});
                del(`${API_URL}lms/courses/${id}`, this.token, success, error);
            });
        });
    }

    /**
     * Find by id
     *
     * @param  {integer}    id  The id of the course
     *
     * @return {Promise}        The user with the given id.
     */
    find(id) {
        if (!id) {
            return Promise.resolve(null);
        }
        return this._load().then(
            (courses) => courses.find((course) => course.id === parseInt(id, 10))
        );
    }

    /**
     * Update a course
     *
     * @param  {integer}    id          The id of the course to update
     * @param  {string}     fullname    The fullname of the course
     * @param  {string}     shortname   The shortname of the course
     * @param  {string}     summary     The summary of the course
     *
     * @return {Promise}            Returns the updated course
     */
    update(id, fullname, shortname, summary) {
        if (!id) {
            return Promise.resolve(null);
        }
        return this._load().then(() => {
            return new Promise((resolve, reject) => {
                const payload = { fullname, shortname, summary };
                const errors = [
                    ...validateObjectValues(payload)
                ];
                if (errors.length > 0) {
                    reject({code: 0, errors});
                    return;
                }
                const success = (data) => {
                    if ((typeof data === 'string') && (data.includes('updated'))) {
                        this.data = this.data.filter((course) => course.id !== parseInt(id, 10));
                        const course = new Course(id, fullname, shortname, summary);
                        this.data.push(course);
                        this._sortData();
                        resolve(course);
                    }
                    reject({code: 0, errors: ['Something went wrong on the LMS server.']});
                    return;
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to update the course.']});
                put(`${API_URL}lms/courses/${id}`, this.token, payload, success, error);
            });
        });
    }

    /**
     * Load the course data
     *
     * @return {Array} An array of all the courses
     */
    _load() {
        return new Promise((resolve, reject) => {
            if (this.data.length > 0) {
                resolve(this.data);
                return;
            }
            const success = (data) => {
                if (!Array.isArray(data)) {
                    console.error('No courses were found!', data);
                    reject([]);
                    return;
                }
                this.data = data.map(
                    (course) => new Course(course.id, course.fullname, course.shortname, course.summary)
                );
                this._sortData();
                resolve(this.data);
            };
            const error = (code) => reject({code, errors: ['Unable to retrieve the courses from the API.']});
            get(`${API_URL}lms/courses`, this.token, success, error);
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
