import {API_URL, put} from "../api/api";
import openSnackBar from "../components/snackbar";

/**
 * Open a snackbar and display a success message
 * @param name the updated field
 */
function successCallback(name) {
    openSnackBar(`${name} updated!`, 'success');
}

/**
 * Open a snackbar and display an error message
 * @param name the updated field
 */
function errorCallback(code) {
    if (code === 401) window.location.href = "/admin/login.html";
    openSnackBar('Unknown error occurred. Please try later', 'error');
}

/**
 * Send the new value of a field with a put request
 * @param name the name of the field for the API
 * @param payload the payload (often  {value:...})
 * @param token the token to authenticate the request
 */
function setProperty(name, payload, token, callback) {
    put(`${API_URL}${name}`, token, payload, callback || (() => successCallback(name)), errorCallback)
}

/**
 * Attach a callback to the send button of a form
 * @param id the id of the form
 * @param updateCallback the callback to attach
 */
function attachUpdate(id, updateCallback) {
    const form = document.getElementById(`${id}-send`);
    form.addEventListener('click', updateCallback)
}

/**
 * Show spinner instead of done icon
 * @param id
 */
function showLoader(id) {
    document.getElementById(`${id}-send`).style.display = 'none';
    const loader = document.getElementById(`${id}-loader`)
    if(loader)
        loader.style.display = 'block';
}

/**
 * Hide spinner and show save icon again
 * @param id
 */
function hideLoader(id) {
    document.getElementById(`${id}-send`).style.display = 'block';
    const loader = document.getElementById(`${id}-loader`)
    if(loader)
        loader.style.display = 'none';
}

/**
 * Send new value of a textual field when clicked on the send button
 * @param name the name of the field for the api
 * @param id the id of the form
 * @param token the token to authenticate the request
 */
function attachUpdateCallbackToTextField(name, id, token) {
    attachUpdate(id, (e) => {
        e.preventDefault();
        showLoader(id);
        const value = document.getElementById(`${id}-input`).value;
        setProperty(name, {value}, token, () => {
            successCallback(name);
            hideLoader(id);
        });
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
        setProperty("brand", {value: `${name}=${value}`}, token, () => {
            successCallback(name);
            hideLoader(id);
        });
    })
}

/**
 * Send new value of a switch when clicked on the send button
 * @param name the name of the field for the api
 * @param id the id of the form
 * @param token the token to authenticate the request
 */
function attachUpdateBrandCallbackToSwitch(name, id, token) {
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
 */
function setPropertyRecursive(i, names, values, token, finalCallback) {
    if (i >= values.length)
        finalCallback();

    const value = values[i];
    setProperty(names[i], {value}, token, () => {
        successCallback(names[i]);
        setPropertyRecursive(i + 1, names, values, token, finalCallback);
    });
}

/**
 * Attach to a single button (by id) sending of several fields (in fields)
 * @param fields an array of fields [{name:String, id:String}]
 * @param id the id of the button
 * @param token the token
 */
function attachUpdateToMultipleTextFields(fields, id, token) {
    attachUpdate(id, (e) => {
        e.preventDefault();

        showLoader(id);

        const names = fields.map(field => field.name);
        const values = fields.map(field => document.getElementById(`${field.id}-input`).value)

        setPropertyRecursive(0, names, values, token, () => {
            hideLoader(id);
        });
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
 * Attach all fields to their corresponding update callbacks
 * @param token the token to authenticate the requests
 */
export default function attachUpdateCallbacks(token) {
    // Multiple text fields
    attachUpdateToMultipleTextFields([
        {id: 'ssid', name: 'ssid'},
        {id: 'channel', name: 'channel'},
        {id: 'wpa-passphrase', name: 'wpa-passphrase'},
    ], 'wap', token);
    attachUpdateToMultipleTextFields([
        {id: 'client-ssid', name: 'client-ssid'},
        {id: 'client-wifipassword', name: 'client-wifipassword'},
        {id: 'client-wificountry', name: 'client-wificountry'},
    ], 'client_wifi', token);

    // Text fields
    attachUpdateCallbackToTextField('hostname', 'hostname', token);
    attachUpdateCallbackToTextField('password', 'password', token);
    attachUpdateCallbackToTextField('openwell-download', 'openwell-download', token);
    attachUpdateCallbackToTextField('moodle_download', 'moodle_download', token);

    // Switch (parse true/false)
    attachUpdateBrandCallbackToSwitch('enable_mass_storage', 'enable_mass_storage', token);
    attachUpdateBrandCallbackToSwitch('usb0NoMount', 'usb0NoMount', token);
    attachUpdateBrandCallbackToSwitch('enhanced', 'enhanced', token);

    // Screen_Enable group of switches
    attacheUpdateCallbackToScreenEnable('screen_enable_main_page', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_info_page', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_battery_page', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_battery_details_page', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_memory_page', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_stats_pages', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_admin_pages', token);

    // Brand text inputs
    attachUpdateBrandCallbackToTextField('server_url', 'server_url', token);
    attachUpdateBrandCallbackToTextField('server_authorization', 'server_authorization', token);
    attachUpdateBrandCallbackToTextField('server_sitename', 'server_sitename', token);
    attachUpdateBrandCallbackToTextField('server_siteadmin_name', 'server_siteadmin_name', token);
    attachUpdateBrandCallbackToTextField('server_siteadmin_email', 'server_siteadmin_email', token);
    attachUpdateBrandCallbackToTextField('server_siteadmin_phone', 'server_siteadmin_phone', token);
    attachUpdateBrandCallbackToTextField('g_device', 'lcd_g_device', token);
}