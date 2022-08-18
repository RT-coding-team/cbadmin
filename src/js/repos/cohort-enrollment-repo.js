import {API_URL, get, put } from '../api/api';
import { CohortMembership } from '../models/cohort-membership';

/**
 * A class that stores and manages the enrollment of users into a cohort (class).
 *
 * TODO: Consider tracking empty cohorts to limit API requests
 */
export class CohortEnrollmentRepo {

    /**
     * Build the repository
     *
     * @param {string}      token       The API token
     * @param {UsersRepo}   usersRepo   The User's repository
     */
    constructor(token, usersRepo) {
        this.token = token;
        this.usersRepo = usersRepo;
        this.memberships = [];
    }

    /**
     * Enroll a user into a cohort
     *
     * @param  {integer}    cohortId    The cohort id
     * @param  {integer}    userId      The user id
     *
     * @return {Promise<Boolean>}       Was the student successfully enrolled?
     */
    enroll(cohortId, userId) {
        if ((!cohortId) || (!userId)) {
            return Promise.resolve(false);
        }
        return this.isEnrolled(cohortId, userId).then((enrolled) => {
            if (enrolled) {
                return true;
            }
            return new Promise((resolve, reject) => {
                const success = (data) => {
                    if ((typeof data === 'string') && (data.includes('enrolled'))) {
                        const membership = new CohortMembership(cohortId, userId);
                        this.memberships.push(membership);
                        console.log(this.memberships);
                        resolve(true);
                        return;
                    }
                    resolve(false);
                };
                const error = (code) => reject({code, errors: ['Sorry, we were unable to enroll the user into the class.']});
                put(`${API_URL}lms/classes/${cohortId}/users/${userId}`, this.token, {}, success, error);
            });
        });
    }

    unenroll(cohortId, userId) {}

    /**
     * Is the user enrolled in the cohort?
     *
     * @param  {integer}    cohortId    The cohort id
     * @param  {integer}    userId      The user id
     *
     * @return {Promise<Boolean>}       Are they enrolled?
     */
    isEnrolled(cohortId, userId) {
        // Load the roster before checking the enrollment status
        return this.roster(cohortId).then(() => {
            const found = this.memberships.find(
                (m) => ((m.cohortId === parseInt(cohortId, 10)) && (m.userId === parseInt(userId, 10)))
            );
            return (typeof found !== 'undefined');
        });
    }

    /**
     * Retrieve the roster of cohort memberships
     *
     * @param  {integer}    cohortId    The cohort id
     *
     * @return {Promise<User[]>}        The users that are enrolled in the cohort
     */
    roster(cohortId) {
        if (!cohortId) {
            return Promise.reject({code: 200, errors: ['The class could not be found.']});
        }
        const current = this.memberships.filter((member) => member.cohortId === parseInt(cohortId, 10));
        if (current.length > 0) {
            const ids = current.map((member) => member.userId);
            return this.usersRepo.findByIds(ids);
        }
        return new Promise((resolve, reject) => {
            const success = (data) => {
                if (data.length === 0) {
                    resolve([]);
                    return;
                }
                const ids = [];
                data[0].userids.forEach((userId) => {
                    ids.push(userId);
                    this.memberships.push(new CohortMembership(cohortId, userId));
                });
                this.usersRepo.findByIds(ids).then((users) => resolve(users));
            };
            const error = (code) => reject({code, errors: ['Sorry, we were unable to retrieve the class roster.']});
            get(`${API_URL}lms/classes/${cohortId}/users`, this.token, success, error);
        });
    }
}
