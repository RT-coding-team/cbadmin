import {API_URL, del, get, post, put} from '../api/api';
import { Course } from '../models/course';

/**
* A class that stores and manages our LMS courses.  This was designed to reduce the
* number of requests made to the API by storing the data locally.
 */
export class CoursesRepo {

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
     * get all the courses
     *
     * @return {Promise} An array of all the courses
     */
    all() {
        return this._load();
    }

    /**
     * Load the user data
     *
     * @return {Array} An array of all the courses
     */
    _load() {
        return new Promise((resolve, revoke) => {
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
                    (course) => new Course(course.id, course.displayname, course.fullname, course.shortname, course.summary)
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
