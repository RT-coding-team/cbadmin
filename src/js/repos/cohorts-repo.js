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
     * @param {string} token  The API token
     */
    constructor(token) {
        this.token = token;
        this.data = [];
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
            const error = (code) => reject({code, errors: ['Unable to retrieve the cohorts (classes) from the API.']});
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
