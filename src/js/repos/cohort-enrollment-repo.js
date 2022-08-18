import {API_URL, get } from '../api/api';
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

    enroll(cohortId, userId) {}

    unenroll(cohortId, userId) {}

    isEnrolled(cohortId, userId) {}

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
