import {API_URL, del, get, post, put} from '../api/api';
import { Course } from '../models/course';
import { CourseMember } from '../models/course-member';
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
     * @param {UsersRepo}   usersRepo   The User's repository
     */
    constructor(token, usersRepo) {
        this.token = token;
        this.usersRepo = usersRepo;
        this.data = [];
        this.roles = {
            1: 'Manager',
            4: 'Non-editing Teacher',
            5: 'Student',
            3: 'Teacher',
        };
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
     * Enroll a user into a course
     *
     * @param  {integer}    id                  The id of the course
     * @param  {integer}    userId              The user id to enroll
     * @param  {integer}    roleId              The role id for the user
     *
     * @return {Promise<boolean>}   Were they successfuly enrolled?
     */
    enroll(id, userId, roleId) {
        if ((!id) || (!userId) || (!roleId)) {
            return Promise.resolve(false);
        }
        // Make sure the list of users for the course is loaded before enrolling
        return this.roster(id).then(() => {
            const currentIndex = this.data.findIndex((course) => (course.id === parseInt(id, 10)));
            if (currentIndex === -1) {
                return Promise.reject({code: 200, errors: ['The course could not be found.']});
            }
            if (this.data[currentIndex].isEnrolled(userId)) {
                return true;
            }
            return new Promise((resolve, reject) => {
                const success = (results) => {
                    if ((typeof results === 'string') && (results.includes('enrolled'))) {
                        return this.usersRepo.find(userId).then((user) => {
                            const member = new CourseMember(user);
                            member.addRole(roleId, this.roles[roleId]);
                            this.data[currentIndex].enroll(member);
                            resolve(true);
                        });
                    }
                    resolve(false);
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to enroll the user in the course.']});
                put(`${API_URL}lms/courses/${id}/users/${userId}`, this.token, { roleid: parseInt(roleId, 10) }, success, error);
            });
        })
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
     * Get a list of the users in this course
     *
     * @param  {integer}    id  The id of the course to get the roster for
     *
     * @return {Promise<CourseMember[]>}      A list of Course Members
     */
    roster(id) {
        if (!id) {
            return Promise.reject({code: 200, errors: ['The course could not be found.']});
        }
        return this._load().then(() => {
            const currentIndex = this.data.findIndex((course) => (course.id === parseInt(id, 10)));
            if (currentIndex === -1) {
                return Promise.reject({code: 200, errors: ['The course could not be found.']});
            }
            if (this.data[currentIndex].membersAdded) {
                return this.data[currentIndex].enrolled();
            }
            return new Promise((resolve, reject) => {
                const success = (results) => {
                    if (results.length === 0) {
                        // We do not want to request the API again, but there are no students
                        this.data[currentIndex].membersAdded = true;
                        resolve([]);
                        return;
                    }
                    results.forEach((person) => {
                        const user = new User(
                            person.id,
                            person.email,
                            person.firstname,
                            person.fullname,
                            person.lastname,
                            person.username
                        );
                        const member = new CourseMember(user);
                        person.roles.forEach((role) => member.addRole(role.roleid, role.shortname));
                        this.data[currentIndex].enroll(member);
                        resolve(this.data[currentIndex].enrolled());
                    });
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to retrieve the course roster.']});
                get(`${API_URL}lms/courses/${id}/users`, this.token, success, error);
            });
        });
    }

    /**
     * Remove a student from a course
     *
     * @param  {integer}    id                  The id of the course
     * @param  {integer}    userId              The user id to unenroll
     *
     * @return {Promise<boolean>}               Was it successful?
     */
    unenroll(id, userId) {
        if ((!id) || (!userId)) {
            return Promise.resolve(false);
        }
        return this.roster(id).then(() => {
            const currentIndex = this.data.findIndex((course) => (course.id === parseInt(id, 10)));
            if (currentIndex === -1) {
                return Promise.reject({code: 200, errors: ['The course could not be found.']});
            }
            if (!this.data[currentIndex].isEnrolled(userId)) {
                return true;
            }
            return new Promise((resolve, reject) => {
                const success = (results) => {
                    if ((typeof results === 'string') && (results.includes('unenrolled'))) {
                        this.data[currentIndex].unenroll(userId);
                        resolve(true);
                        return;
                    }
                    resolve(false);
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to enroll the user in the course.']});
                del(`${API_URL}lms/courses/${id}/users/${userId}`, this.token, success, error);
            });
        });
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
