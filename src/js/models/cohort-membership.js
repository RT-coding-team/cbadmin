/**
 * A model for an LMS cohort memberships (class in UI).
 */
export class CohortMembership {

    /**
     * Build the model
     *
     * @param {integer} cohortId    The cohort's id
     * @param {integer} userId      The user's id
     */
    constructor(cohortId, userId) {
        this.cohortId = parseInt(cohortId, 10);
        this.userId = parseInt(userId, 10);
    }

}
