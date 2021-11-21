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
function setProperty(name, payload, token) {
    put(`${API_URL}${name}`, token, payload, () => successCallback(name), errorCallback)
}

/**
 * Attach a callback to the send button of a form
 * @param id the id of the form
 * @param updateCallback the callback to attach
 */
function attachUpdate(id, updateCallback) {
    console.log(id)
    const form = document.getElementById(`${id}-send`);
    form.addEventListener('click', updateCallback)
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
        const value = document.getElementById(`${id}-input`).value;
        setProperty(name, {value}, token);
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
        const value = document.getElementById(`${id}-input`).value;
        setProperty("brand", {value: `${name}=${value}`}, token);
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
        const value = document.getElementById(`${id}-input`).checked ? 1 : 0 ;
        setProperty("brand", {value:`${name}=${value}`}, token);
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
    // Text fields
    attachUpdateCallbackToTextField('ssid', 'ssid', token);
    attachUpdateCallbackToTextField('client-ssid', 'client-ssid', token);
    attachUpdateCallbackToTextField('client-wifipassword', 'client-wifipassword', token);
    attachUpdateCallbackToTextField('channel', 'channel', token);
    attachUpdateCallbackToTextField('wpa-passphrase', 'wpa-passphrase', token);
    attachUpdateCallbackToTextField('hostname', 'hostname', token);
    attachUpdateCallbackToTextField('password', 'password', token);

    // Switch (parse true/false)
    attachUpdateBrandCallbackToSwitch('enable_mass_storage', 'enable_mass_storage', token);
    attachUpdateBrandCallbackToSwitch('usb0NoMount', 'usb0NoMount', token);
    attachUpdateBrandCallbackToSwitch('enhanced', 'enhanced', token);

    // Screen_Enable group of switches
    attacheUpdateCallbackToScreenEnable('screen_enable_main_page', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_info_page', token);
    attacheUpdateCallbackToScreenEnable('screen_enable_battery_page', token);
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
    attachUpdateBrandCallbackToTextField('openwell-download', 'openwell-download', token);
    attachUpdateBrandCallbackToTextField('moodle_download', 'moodle_download', token);
}