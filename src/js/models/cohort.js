/**
 * A model for an LMS cohort (class in UI)
 */
export class Cohort {
    constructor(id, name) {
        this.id = parseInt(id, 10);
        this.name = name;
    }
}
