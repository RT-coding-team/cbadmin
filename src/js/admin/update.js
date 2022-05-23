import {API_URL, del, get, post, put} from "../api/api";
import openSnackBar from "../components/snackbar";
import openPopup from "../components/popup";
import {successMessage, successMessages} from "../messages/messages";
import {
    alphaSortWithKey, appendItemsToList, appendOptionsToSelect, validateLMSEmail,
    validateLMSPassword, validateLMSUsername, validateObjectValues
} from '../utils/utils';

/**
 * Open a snackbar and display a success message
 * @param name the updated field
 */
function successCallback(name) {
    openSnackBar(successMessage(name), 'success');
}

/**
 * Open a snackbar and display an error message
 * @param name the updated field
 */
function errorCallback(code) {
    if (code === 401) window.location.href = "/admin/login.html";
    openSnackBar(`Unable to Save To Database: ${error}`);
}

function passwordMismatch() {
	openSnackBar('Sorry, your passwords do not match');
}

/**
 * Send the new value of a field with a put request
 * @param name the name of the field for the API
 * @param payload the payload (often  {value:...})
 * @param token the token to authenticate the request
 * @param callback if provided, override the default callback (that open a modal)
 * @param loaderId if provided, hide the loader associated and show the button with this id
 */
function setProperty(name, payload, token, callback, loaderId = null) {
	// First check if this is password update for matching confirmation password prior to PUT
	openSnackBar('Processing...','success');
	if (name === "password" && document.getElementById(`password-input`).value.length > 5 && document.getElementById(`password-input`).value !== document.getElementById(`passwordConfirm-input`).value) {
		if (loaderId) hideLoader(loaderId);
		passwordMismatch();
	}
	else {
		put(`${API_URL}${name}`, token, payload, () => {
			if (callback) callback(name);
			else successCallback(name);
			if (loaderId) hideLoader(loaderId)
		}, (code) => {
			errorCallback(code);
			if (loaderId) hideLoader(loaderId);
		})
	}
}

/**
 * Attach a callback to the send button of a form
 * @param id the id of the form
 * @param updateCallback the callback to attach
 */
function attachUpdate(id, updateCallback) {
    const form = document.getElementById(`${id}-btn`);
    form.addEventListener('click', updateCallback)
}

/**
 * Attach a callback to the send button of a form
 * @param id the id of the form
 * @param updateCallback the callback to attach
 */
function attachUpdateCallbackToSelect(id) {
	console.log(`attachUpdateCallbackToSelect: ${id}`);
    var select = document.getElementById(`${id}-input`);
    select.addEventListener('change', (event) => {
		console.log('Changing SSID to available network: ' + event.target.value);
		document.getElementById('client-ssid-input').value = event.target.value;
		document.getElementById('client-wifipassword-input').value = "";
	});
}

/**
 * Show spinner instead of done icon
 * @param id
 */
function showLoader(id) {
    document.getElementById(`${id}-btn`).style.display = 'none';
    const loader = document.getElementById(`${id}-loader`)
    if (loader)
        loader.style.display = 'block';
}

/**
 * Hide spinner and show save icon again
 * @param id
 */
function hideLoader(id) {
    document.getElementById(`${id}-btn`).style.display = 'block';
    const loader = document.getElementById(`${id}-loader`)
    if (loader)
        loader.style.display = 'none';
}

/**
 * Send new value of a textual field when clicked on the send button
 * @param name the name of the field for the api
 * @param id the id of the form
 * @param token the token to authenticate the request
 */
function attachUpdateCallbackToTextField(name, id, token, callback = null) {
    attachUpdate(id, (e) => {
        e.preventDefault();
        showLoader(id);
        const value = document.getElementById(`${id}-input`).value;
        setProperty(name, {value}, token, callback, id);
    })
}

/**
 * Send new value of a switch when clicked on the send button
 * @param name the name of the field for the api
 * @param id the id of the form
 * @param token the token to authenticate the request
 */
function attachUpdateCallbackToSwitch(name, id, token, callback = null) {
	console.log(`attachUpdateCallbackToSwitch: ${name}: ${id}`);
    const element = document.getElementById(`${id}-switch`)
    element.addEventListener('click', (e) => {
        e.preventDefault();
        const value = document.getElementById(`${id}-input`).checked ? 1 : 0;
        setProperty(name, {value}, token, callback, id);
    })
}

/**
 * Send new value of a textual field when clicked on the send button
 * @param name the name of the field for the api
 * @param id the id of the form
 * @param token the token to authenticate the request
 */
function attachUpdateBrandCallbackToTextField(name, id, token) {
    attachUpdate(id, (e) => {
        e.preventDefault();
        showLoader(id);
        const value = document.getElementById(`${id}-input`).value;
        setProperty("brand", {value: `${name}=${value}`}, token, null, id);
    })
}

/**
 * Send new value of a switch when clicked on the send button
 * @param name the name of the field for the api
 * @param id the id of the form
 * @param token the token to authenticate the request
 */
function attachUpdateBrandCallbackToSwitch(name, id, token) {
	console.log(`attachUpdateBrandCallbackToSwitch: ${name}: ${id}`);
    const element = document.getElementById(`${id}-switch`)
    element.addEventListener('click', (e) => {
        e.preventDefault();
        const value = document.getElementById(`${id}-input`).checked ? 1 : 0;
        setProperty("brand", {value: `${name}=${value}`}, token);
    })
}

/**
 * Make several API call to set a property sequentials recursively
 *
 * Proof of termination:
 *  - base case: i = values.length < infty
 *  - invariant: (values.length - i) is a positive integer decreasing strictly
 *  So this function ends as soon as i starts under names.length (in practice, start at 0 is safe)
 *
 * @param i the index
 * @param names an array of names of fields
 * @param values an array of values to send
 * @param token the token
 * @param loaderId the id of the button to show when all requests are completed
 */
function setPropertyRecursive(i, names, values, token, loaderId, finalSuccessCallback) {
    if (i >= values.length) return;
	openSnackBar('Processing...','success');
    const value = values[i];
    setProperty(names[i], {value}, token, () => {
        if (i === values.length - 1) finalSuccessCallback();
        setPropertyRecursive(i + 1, names, values, token, loaderId, finalSuccessCallback);
    }, i === values.length - 1 ? loaderId : null);
}

/**
 * Attach to a single button (by id) sending of several fields (in fields)
 * @param fields an array of fields [{name:String, id:String}]
 * @param id the id of the button
 * @param token the token
 */
function attachUpdateToMultipleTextFields(fields, id, token, callback) {
    attachUpdate(id, (e) => {
        e.preventDefault();

        showLoader(id);

        const names = fields.map(field => field.name);
        const values = fields.map(field => document.getElementById(`${field.id}-input`).value)

        setPropertyRecursive(0, names, values, token, id, callback);
    })
}

/**
 * Get the state of a switch (checked / not checked) and convert to int 1 or 0
 * @param id the id of the switch
 * @returns {number}
 */
function getSwitchStatus(id) {
    return document.getElementById(`${id}-input`).checked ? 1 : 0
}

/**
 * As soon as one of the switch of screen enable is clicked, send PUT request to set Screen_Enable, with all other switches
 * @param id the id of the switch to listen to
 * @param token the token to authenticate the requests
 */
function attacheUpdateCallbackToScreenEnable(id, token) {
    const element = document.getElementById(`${id}-switch`)
    element.addEventListener('click', (e) => {
        const new_screens = [
            getSwitchStatus('screen_enable_main_page'),
            getSwitchStatus('screen_enable_info_page'),
            getSwitchStatus('screen_enable_battery_page'),
            getSwitchStatus('screen_enable_battery_details_page'),
            getSwitchStatus('screen_enable_memory_page'),
            ...(getSwitchStatus('screen_enable_stats_pages') ? [1, 1, 1, 1, 1, 1, 1, 1] : [0, 0, 0, 0, 0, 0, 0, 0]),
            getSwitchStatus('screen_enable_admin_pages'),
        ]
        setProperty('brand', {value: `Screen_Enable=${JSON.stringify(new_screens)}`}, token);
    })
}

/**
 * Attach the callbacks for adding LMS users
 *
 * @param  {string} token   the token to authenticate the requests
 * @return {void}
 */
function attachLMSCallbacksForAddingUsers(token) {
    const saveButton = document.getElementById('moodle_users_add-btn');
    const saveSuccessCallback = (data) => {
        hideLoader('moodle_users_add');
        saveButton.classList.remove('d-none');
        document.getElementById('moodle_username-input').value = '';
        document.getElementById('moodle_password-input').value = '';
        document.getElementById('moodle_firstname-input').value = '';
        document.getElementById('moodle_lastname-input').value = '';
        document.getElementById('moodle_email-input').value = '';
        const selector = document.getElementById('moodle_users-input');
        lmsUpdateUserSelector(selector, token);
        if ((Array.isArray(data)) && ('id' in data[0])) {
            openSnackBar('The user has been added', 'success');
            return;
        }
        console.error(data);
        openSnackBar('Sorry, we were unable to add the user.', 'error');
    };
    saveButton.addEventListener('click', (event) => {
        event.preventDefault();
        const username = document.getElementById('moodle_username-input').value;
        const password = document.getElementById('moodle_password-input').value;
        const firstname = document.getElementById('moodle_firstname-input').value;
        const lastname = document.getElementById('moodle_lastname-input').value;
        const email = document.getElementById('moodle_email-input').value;
        let payload = { username, firstname, lastname, email, password };
        const errors = [
            ...validateObjectValues(payload),
            ...validateLMSPassword(password),
            ...validateLMSUsername(username),
            ...validateLMSEmail(email)
        ];
        if (errors.length > 0) {
            openSnackBar(errors.join("\r\n"), 'error');
            return false;
        }
        saveButton.classList.add('d-none');
        showLoader('moodle_users_add');
        post(`${API_URL}/lms/users`, token, payload, saveSuccessCallback, errorCallback);
        return false;
    });

}

/**
 * Update the course roster list.  Adds a data-enrolled on the provided list with all the ids
 * of enrolled users.
 *
 * @param  {object}     list        The list to update
 * @param  {token}      token       The API token
 * @param  {integer}    courseId    The course to retrieve the id for
 * @param  {String}     emptyText   The text to display if no users are found
 * @return {void}
 */
function lmsUpdateCourseRosterList(list, token, courseId, emptyText = 'Sorry, no users found.') {
    const courseSuccessCallback = (data) => {
        const ids = data.map((user) => user.id);
        list.innerHTML = '';
        list.setAttribute('data-enrolled', ids.join('|'));
        if (data.length == 0) {
            const li = document.createElement('li');
            li.innerHTML = emptyText;
            list.appendChild(li);
            return;
        }
        const values = data.map((user) => {
            const roles = user.roles.map((role) =>  role.shortname);
            const roleText = (roles.length > 0) ? ` (${roles.join(', ')})` : '';
            return { title: `${user.fullname}${roleText}` };
        });
        appendItemsToList(list, values, 'title');
    }
    get(`${API_URL}/lms/courses/${courseId}/users`, token, courseSuccessCallback, errorCallback);
}

/**
 * Update the LMS user selector
 *
 * @param   {object}    selector    the selector to update
 * @param   {string}    token       the token to authenticate the requests
 * @param   {array}     exclude     an array of user ids that you want to exclude
 * @return  {void}
 */
function lmsUpdateUserSelector(selector, token, exclude = []) {
    const lmsUserSelectRender = (data) => {
        if (!('users' in data)) {
            console.error('No users were found!', value);
        }
        const users = data.users.filter((user) => (!exclude.includes(user.id)));
        appendOptionsToSelect(selector, users, 'fullname', 'id');
    };
    get(`${API_URL}/lms/users`, token, lmsUserSelectRender, errorCallback);
}

/**
 * Attach the callbacks for deleting LMS users
 *
 * @param   {string}    token   the token to authenticate the requests
 * @param   {object}    wrapper the form wrapper
 * @return {void}
 */
function attachLMSCallbacksForDeletingUser(token, wrapper) {
    const deleteButton = document.getElementById('moodle_users_account_remove-btn');
    const deleteSuccessCallback = (data) => {
        wrapper.classList.add('d-none');
        const selector = document.getElementById('moodle_users-input');
        lmsUpdateUserSelector(selector, token);
        hideLoader('moodle_users_account_remove');
        deleteButton.classList.remove('d-none');
        if ((typeof data === 'string') && (data.includes('deleted'))) {
            openSnackBar(data, 'success');
            return;
        }
        console.error(data);
        openSnackBar('Sorry, we were unable to delete the user.', 'error');
    };
    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        const id = document.getElementById('moodle_update_user_id-input').value;
        const username = document.getElementById('moodle_update_username-input').value;
        if (!id) {
            return false;
        }
        if (confirm(`Are you sure you want to delete the account: ${username}?`)) {
            deleteButton.classList.add('d-none');
            showLoader('moodle_users_account_remove');
            del(`${API_URL}/lms/users/${id}`, token, deleteSuccessCallback, errorCallback);
        }
        return false;
    });
}

/**
 * Attach the callbacks for updating LMS users
 *
 * @param  {string}     token   the token to authenticate the requests
 * @param   {object}    wrapper the form wrapper
 * @return {void}
 */
function attachLMSCallbacksForUpdatingUsers(token, wrapper) {
    const saveButton = document.getElementById('moodle_users_update-btn');
    const saveSuccessCallback = (data) => {
        wrapper.classList.add('d-none');
        const selector = document.getElementById('moodle_users-input');
        lmsUpdateUserSelector(selector, token);
        hideLoader('moodle_users_update');
        saveButton.classList.remove('d-none');
        if ((typeof data === 'string') && (data.includes('updated'))) {
            openSnackBar(data, 'success');
            return;
        }
        console.error(data);
        openSnackBar('Sorry, we were unable to update the user.', 'error');
    };
    saveButton.addEventListener('click', (event) => {
        event.preventDefault();
        const id = document.getElementById('moodle_update_user_id-input').value;
        if (!id) {
            return false;
        }
        const username = document.getElementById('moodle_update_username-input').value;
        const password = document.getElementById('moodle_update_password-input').value;
        const firstname = document.getElementById('moodle_update_firstname-input').value;
        const lastname = document.getElementById('moodle_update_lastname-input').value;
        const email = document.getElementById('moodle_update_email-input').value;
        let payload = { username, firstname, lastname, email };
        let errors = [];
        if (password !== '') {
            payload['password'] = password;
            errors = [
                ...validateLMSPassword(password),
                ...validateLMSUsername(username),
                ...validateLMSEmail(email),
            ];
        } else {
            errors = [
                ...validateLMSUsername(username),
                ...validateLMSEmail(email)
            ];
        }
        if (errors.length > 0) {
            console.log('here', errors);
            openSnackBar(errors.join("\r\n"), 'error');
            return false;
        }
        saveButton.classList.add('d-none');
        showLoader('moodle_users_update');
        put(`${API_URL}/lms/users/${id}`, token, payload, saveSuccessCallback, errorCallback);
        return false;
    });
}

/**
 * Attach callbacks for enrolling students
 *
 * @param  {string} token   the token to authenticate the requests
 * @param  {object} list    the list to update
 * @return {void}
 */
function attachLMSCallbacksForEnrollingUser(token) {
    const courseSelect = document.getElementById('moodle_courses-input');
    const enrollButton = document.getElementById('moodle_courses_users_add-btn');
    const unenrollButton = document.getElementById('moodle_courses_users_remove-btn');
    unenrollButton.classList.add('d-none');
    const studentSelector = document.getElementById('moodle_enrollees-input');
    const list = document.getElementById('course-users-list');
    const enrollSuccessCallback = (data) => {
        if ((typeof data === 'string') && (data.includes('enrolled'))) {
            // update the list of enrollees
            const courseId = courseSelect.value;
            lmsUpdateCourseRosterList(list, token, courseId);
            enrollButton.classList.add('d-none');
            unenrollButton.classList.remove('d-none');
            openSnackBar(data, 'success');
            return;
        }
        console.error(data);
        openSnackBar('Sorry, we were unable to enroll the user in the course.', 'error');
    };
    enrollButton.addEventListener('click', (event) => {
        event.preventDefault();
        const courseId = courseSelect.value;
        const userId = document.getElementById('moodle_enrollees-input').value;
        const errors = [];
        const enrolled = list.getAttribute('data-enrolled');
        if (!courseId) {
            errors.push('Please select a course.');
        }
        if (!userId) {
            errors.push('Please select an enrollee.');
        }
        if (enrolled.split('|').includes(userId)) {
            errors.push('The user is already enrolled.');
        }
        if (errors.length > 0) {
            openSnackBar(errors.join("\r\n"), 'error');
            return false;
        }
        put(`${API_URL}/lms/courses/${courseId}/users/${userId}`, token, {}, enrollSuccessCallback, errorCallback);
        return false;
    });
    const unenrollSuccessCallback = (data) => {
        if ((typeof data === 'string') && (data.includes('unenrolled'))) {
            // update the list of enrollees
            const courseId = courseSelect.value;
            lmsUpdateCourseRosterList(list, token, courseId);
            enrollButton.classList.remove('d-none');
            unenrollButton.classList.add('d-none');
            openSnackBar(data, 'success');
            return;
        }
        console.error(data);
        openSnackBar('Sorry, we were unable to remove the user in the course.', 'error');
    };
    unenrollButton.addEventListener('click', () => {
        event.preventDefault();
        const courseId = courseSelect.value;
        const userId = document.getElementById('moodle_enrollees-input').value;
        const errors = [];
        const enrolled = list.getAttribute('data-enrolled');
        if (!courseId) {
            errors.push('Please select a course.');
        }
        if (!userId) {
            errors.push('Please select an enrollee.');
        }
        if (!enrolled.split('|').includes(userId)) {
            errors.push('The user is not enrolled in the class.');
        }
        if (errors.length > 0) {
            openSnackBar(errors.join("\r\n"), 'error');
            return false;
        }
        del(`${API_URL}/lms/courses/${courseId}/users/${userId}`, token, unenrollSuccessCallback, errorCallback);
        return false;
    });
    courseSelect.addEventListener('change', ()  =>  {
        const courseId = courseSelect.value;
        studentSelector.value = '';
        lmsUpdateCourseRosterList(list, token, courseId);
    });
    studentSelector.addEventListener('change', () => {
        const enrolled = list.getAttribute('data-enrolled');
        const studentId = studentSelector.value;
        if (enrolled.split('|').includes(studentId)) {
            // if user is enrolled, display the unenroll button
            enrollButton.classList.add('d-none');
            unenrollButton.classList.remove('d-none');
        } else {
            // if the user is not enrolled, display the enroll button
            enrollButton.classList.remove('d-none');
            unenrollButton.classList.add('d-none');
        }
    });
}

/**
 * Attach the callbacks for updating LMS courses
 *
 * @param  {string} token   the token to authenticate the requests
 * @return {void}
 */
function attachLMSCallbacksForUpdatingCourses(token) {

}

/**
 * Attach the callbacks for deleting LMS courses
 *
 * @param  {string} token   the token to authenticate the requests
 * @return {void}
 */
function attachLMSCallbacksForDeletingCourses(token) {

}

/**
 * Attach the callbacks for the add LMS user form
 *
 * @param  {string} token   the token to authenticate the requests
 * @return {void}
 */
function attachLMSCallbacksForAddUserForm(token) {
    attachLMSCallbacksForAddingUsers(token);
}

/**
 * Attach the callbacks for update LMS user form
 *
 * @param  {string} token   the token to authenticate the requests
 * @return {void}
 */
function attachLMSCallbacksForUpdateUserForm(token) {
    // Handle the user selector on the update form
    const userSelect = document.getElementById('moodle_users-input');
    const wrapper = document.getElementById('moodle_users-update-form');
    const userSuccessCallback = (data) => {
        const user = data[0];
        document.getElementById('moodle_update_username-input').value = user.username;
        document.getElementById('moodle_update_password-input').value = '';
        document.getElementById('moodle_update_firstname-input').value = user.firstname;
        document.getElementById('moodle_update_lastname-input').value = user.lastname;
        document.getElementById('moodle_update_email-input').value = user.email;
        document.getElementById('moodle_update_user_id-input').value = user.id;
        wrapper.classList.remove('d-none');
    };
    userSelect.addEventListener('change', ()  =>  {
        const userId = userSelect.value;
        if (userId) {
            get(`${API_URL}/lms/users/${userId}`, token, userSuccessCallback, errorCallback);
        } else {
            wrapper.classList.add('d-none');
            document.getElementById('moodle_update_username-input').value = '';
            document.getElementById('moodle_update_firstname-input').value = '';
            document.getElementById('moodle_update_lastname-input').value = '';
            document.getElementById('moodle_update_password-input').value = '';
            document.getElementById('moodle_update_email-input').value = '';
            document.getElementById('moodle_update_user_id-input').value = '';
        }
    });
    attachLMSCallbacksForUpdatingUsers(token, wrapper);
    attachLMSCallbacksForDeletingUser(token, wrapper);
}

/**
 * Attach the callbacks for course roster form
 *
 * @param  {string} token   the token to authenticate the requests
 * @return {void}
 */
function attachLMSCallbacksForCourseRosterForm(token) {
    const selector = document.getElementById('moodle_enrollees-input');
    lmsUpdateUserSelector(selector, token);
    attachLMSCallbacksForEnrollingUser(token);
}

/**
 * Attach the callbacks for updating LMS course form
 *
 * @param  {string} token   the token to authenticate the requests
 * @return {void}
 */
function attachLMSCallbacksForCourseUpdateForm(token) {
    attachLMSCallbacksForUpdatingCourses(token);
    attachLMSCallbacksForDeletingCourses(token);
}

/**
 * Attach all fields to their corresponding update callbacks
 * @param token the token to authenticate the requests
 */
export default function attachUpdateCallbacks(token) {
    // Multiple text fields
    attachUpdateToMultipleTextFields([
        {id: 'ssid', name: 'apssid'},
        {id: 'channel', name: 'apchannel'},
        {id: 'wpa-passphrase', name: 'appassphrase'},
        {id: 'wap-wifi-restart', name: 'wifirestart'}
    ], 'wap', token, () => successCallback('wap'));
    attachUpdateToMultipleTextFields([
        {id: 'client-ssid', name: 'clientssid'},
        {id: 'client-wifipassword', name: 'clientpassphrase'},
        {id: 'client-wificountry', name: 'clientcountry'},
        {id: 'client-wifi-restart', name: 'wifirestart'}
    ], 'client_wifi', token, () => successCallback('client_wifi'));

    // Text fields
    attachUpdateCallbackToTextField('wipe', 'wipe', token, () => openPopup('Success', 'The SD card is being wiped'));
    attachUpdateCallbackToTextField('hostname', 'hostname', token);
    attachUpdateCallbackToTextField('password', 'password', token);
    attachUpdateCallbackToTextField('subscribe', 'subscribe', token);
    attachUpdateCallbackToTextField('coursedownload', 'course-download', token, () => openPopup('Success', 'Downloading & Installing Now'));
    attachUpdateCallbackToTextField('courseusb', 'courseusb', token, () => openPopup('Success', 'Installing Course'));

	// Select
	attachUpdateCallbackToSelect('client-wifiscan',null,token);

    // Switch (parse true/false)
	attachUpdateCallbackToSwitch('disable_chat','disable_chat', token);
	attachUpdateCallbackToSwitch('disable_stats','disable_stats', token);
    attachUpdateBrandCallbackToSwitch('usb0nomount', 'usb0nomount', token);

	// Added 20220104 to use keys for LCD pages rather than array
	attachUpdateBrandCallbackToSwitch('lcd_pages_main','lcd_pages_main', token);
	attachUpdateBrandCallbackToSwitch('lcd_pages_info','lcd_pages_info', token);
	attachUpdateBrandCallbackToSwitch('lcd_pages_battery','lcd_pages_battery', token);
	attachUpdateBrandCallbackToSwitch('lcd_pages_multi_bat','lcd_pages_multi_bat', token);
	attachUpdateBrandCallbackToSwitch('lcd_pages_memory','lcd_pages_memory', token);
	attachUpdateBrandCallbackToSwitch('lcd_pages_stats','lcd_pages_stats', token);
	attachUpdateBrandCallbackToSwitch('lcd_pages_admin','lcd_pages_admin', token);

    // Screen_Enable group of switches
    //todo removed for using getProperty for screen enable
//     attacheUpdateCallbackToScreenEnable('screen_enable_main_page', token);
//     attacheUpdateCallbackToScreenEnable('screen_enable_info_page', token);
//     attacheUpdateCallbackToScreenEnable('screen_enable_battery_page', token);
//     attacheUpdateCallbackToScreenEnable('screen_enable_battery_details_page', token);
//     attacheUpdateCallbackToScreenEnable('screen_enable_memory_page', token);
//     attacheUpdateCallbackToScreenEnable('screen_enable_stats_pages', token);
//     attacheUpdateCallbackToScreenEnable('screen_enable_admin_pages', token);

    // Brand text inputs
	attachUpdateBrandCallbackToTextField('otg_enable','otg_enable', token); // otg_enable is actually a select but updating works just like text
    attachUpdateBrandCallbackToTextField('server_url', 'server_url', token);
    attachUpdateBrandCallbackToTextField('server_authorization', 'server_authorization', token);
    attachUpdateBrandCallbackToTextField('server_sitename', 'server_sitename', token);
    attachUpdateBrandCallbackToTextField('server_siteadmin_name', 'server_siteadmin_name', token);
    attachUpdateBrandCallbackToTextField('server_siteadmin_email', 'server_siteadmin_email', token);
    attachUpdateBrandCallbackToTextField('server_siteadmin_phone', 'server_siteadmin_phone', token);
    attachUpdateBrandCallbackToTextField('server_siteadmin_country', 'server_siteadmin_country', token);

    // LMS forms and fields
    attachLMSCallbacksForAddUserForm(token);
    attachLMSCallbacksForUpdateUserForm(token);
    attachLMSCallbacksForCourseRosterForm(token);
    attachLMSCallbacksForCourseUpdateForm(token);

    // attachLMSCallbacksForAddingUsers(token);

    // attachLMSCallbacksForShowingCourseRoster(token);
    // attachLMSCallbacksForUpdatingCourses(token);
    // attachLMSCallbacksForDeletingCourses(token);

    attachUpdateBrandCallbackToTextField('g_device', 'g_device', token);
    attachUpdateBrandCallbackToTextField('enable_mass_storage', 'enable_mass_storage', token);
}
