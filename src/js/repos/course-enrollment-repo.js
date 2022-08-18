import {API_URL, del, get, put } from '../api/api';
import { CourseMembership } from '../models/course-membership';

/**
 * A class that stores and manages the enrollment of users and cohorts into a course.
 *
 * TODO: Consider tracking empty enrollments to limit API requests
 */
export class CourseEnrollmentRepo {

    /**
     * Build the repository
     *
     * @param {CohortsRepo}     cohortsRepo     The Cohort's repository
     * @param {string}          token           The API token
     * @param {UsersRepo}       usersRepo       The User's repository
     */
    constructor(cohortsRepo, token, usersRepo) {
        this.token = token;
        this.cohortsRepo = cohortsRepo;
        this.usersRepo = usersRepo;
        this.memberships = [];
        this.memberTypes = ['user', 'cohort'];
        this.roles = {
            1: 'Manager',
            4: 'Non-editing Teacher',
            5: 'Student',
            3: 'Teacher',
        };
    }

    /**
     * Enroll a member into the course
     *
     * @param  {integer}    courseId    The course id
     * @param  {integer}    memberId    The member id
     * @param  {string}     memberType  The type of member
     * @param  {integer}    roleId      The role id
     *
     * @return {Promise<Boolean>}       Were they successfully enrolled?
     */
    enroll(courseId, memberId, memberType, roleId) {
        if ((!courseId) || (!memberId) || (!this.memberTypes.includes(memberType))) {
            return Promise.resolve(false);
        }
        return this.isEnrolled(courseId, memberId, memberType).then((enrolled) => {
            if (enrolled) {
                return true;
            }
            const label = (memberType === 'cohort') ? 'class' : 'user';
            const plural = (memberType === 'cohort') ? 'classes' : 'users';
            return new Promise((resolve, reject) => {
                const success = (data) => {
                    if ((typeof data === 'string') && (data.includes('enrolled'))) {
                        const membership = new CourseMembership(courseId, memberId, memberType);
                        membership.addRole(roleId, this.roles[roleId]);
                        this.memberships.push(membership);
                        resolve(true);
                        return;
                    }
                    resolve(false);
                };
                const error = (code) => reject({code, errors: [`Sorry, we were unable to enroll the ${label} in the course.`]});
                put(`${API_URL}lms/courses/${courseId}/${plural}/${memberId}`, this.token, { roleid: parseInt(roleId, 10) }, success, error);
            });
        });
    }

    /**
     * Is the member enrolled?
     *
     * @param  {integer}    courseId    The course id
     * @param  {integer}    memberId    The member id
     * @param  {string}     memberType  The type of member
     *
     * @return {Promise<Boolean>}       Are they enrolled?
     */
    isEnrolled(courseId, memberId, memberType) {
        return this.roster(courseId).then(() => {
            const found = this.memberships.find(
                (m) => ((m.courseId === parseInt(courseId, 10)) && (m.memberType === memberType)  && (m.memberId === parseInt(memberId, 10)))
            );
            return (typeof found !== 'undefined');
        });
    }

    /**
     * Get a list of the users and cohorts in this course
     *
     * @param  {integer}    courseId        The id of the course to get the roster for
     *
     * @return {Promise<Object[]>}          An object with users key with all users, and cohorts key with all cohorts
     */
    roster(courseId) {
        if (!courseId) {
            return Promise.reject({code: 200, errors: ['The course could not be found.']});
        }
        return Promise.all([this._cohortRoster(courseId), this._userRoster(courseId)])
            .then((results) => {
                const cohorts = results[0];
                const users = results[1];
                return { cohorts, users  };
            });
    }

    /**
     * Get a list of cohorts in the course
     *
     * @param  {integer}    courseId    The course id
     *
     * @return {Promise<Cohort[]>}      The cohorts in the class
     */
    _cohortRoster(courseId) {
        const current = this.memberships.filter((m) => ((m.courseId === parseInt(courseId, 10)) && (m.memberType === 'cohort')));
        if (current.length > 0) {
            const promises = current.map((membership) => {
                return this.cohortsRepo.find(membership.memberId).then((cohort) => {
                    membership.member = cohort;
                    return membership;
                });
            });
            return Promise.all(promises);
        }
        return new Promise((resolve, reject) => {
            const success = (data) => {
                if (data.data.length === 0) {
                    resolve([]);
                    return;
                }
                const promises = [];
                data.data.forEach((result) => {
                    const membership = new CourseMembership(courseId, result.cohortid, 'cohort');
                    if ('role' in result) {
                        membership.addRole(result.role.id, result.role.shortname);
                    }
                    this.memberships.push(membership);
                    const promise = this.cohortsRepo.find(result.cohortid).then((cohort) => {
                        membership.member = cohort;
                        return membership;
                    });
                    promises.push(promise);
                });
                Promise.all(promises).then((memberships) => resolve(memberships));
            };
            const error = (code) => reject({code, errors: ['Sorry, we were unable to retrieve classes for the course roster.']});
            get(`${API_URL}lms/courses/${courseId}/classes`, this.token, success, error);
        });
    }

    /**
     * Get a list of users that belong to the course
     *
     * @param  {integer}    courseId            The course id
     *
     * @return {Promise<CourseMembership[]>}    The users in the course
     */
    _userRoster(courseId) {
        const current = this.memberships.filter((m) => ((m.courseId === parseInt(courseId, 10) && (m.memberType === 'user'))));
        if (current.length > 0) {
            const promises = current.map((membership) => {
                return this.usersRepo.find(membership.memberId).then((user) => {
                    membership.member = user;
                    return membership;
                });
            });
            return Promise.all(promises);
        }
        return new Promise((resolve, reject) => {
            const success = (data) => {
                if (data.length === 0) {
                    resolve([]);
                    return;
                }
                const promises = [];
                data.forEach((person) => {
                    const membership = new CourseMembership(courseId, person.id, 'user');
                    person.roles.forEach((role) => membership.addRole(role.roleid, role.shortname));
                    this.memberships.push(membership);
                    const promise = this.usersRepo.find(person.id).then((user) => {
                        membership.member = user;
                        return membership;
                    });
                    promises.push(promise);
                });
                Promise.all(promises).then((memberships) => resolve(memberships));
            };
            const error = (code) => reject({code, errors: ['Sorry, we were unable to retrieve users for the course roster.']});
            get(`${API_URL}lms/courses/${courseId}/users`, this.token, success, error);
        });
    }

}
