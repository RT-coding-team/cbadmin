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
function errorCallback() {
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
 * Send new value of a switch when clicked on the send button
 * @param name the name of the field for the api
 * @param id the id of the form
 * @param token the token to authenticate the request
 */
function attachUpdateCallbackToSwitch(name, id, token) {
    attachUpdate(id, (e) => {
        e.preventDefault();
        const value = JSON.stringify(document.getElementById(`${id}-input`).checked);
        setProperty(name, {value}, token);
    })
}

/**
 * Send new value of ui-config, with the new banner message
 * @param token the token to authenticate the request
 */
function attachUpdateCallbackToUIConfig(token) {
    attachUpdate('banner-message', (e) => {
        e.preventDefault();
        const element = document.getElementById('banner-message-input');
        const previousUiConfig = element.getAttribute('data-ui-config');
        const uiConfigObject = JSON.parse(previousUiConfig);
        uiConfigObject.Client.banner = element.value;
        setProperty('ui-config', uiConfigObject, token);
    })
}

/**
 * Attach all fields to their corresponding update callbacks
 * @param token the token to authenticate the requests
 */
export default function attachUpdateCallbacks(token) {
    // Text fields
    attachUpdateCallbackToTextField('ssid', 'ssid', token);
    attachUpdateCallbackToTextField('channel', 'channel', token);
    attachUpdateCallbackToTextField('wpa-passphrase', 'wpa-passphrase', token);
    attachUpdateCallbackToTextField('hostname', 'hostname', token);
    attachUpdateCallbackToTextField('password', 'password', token);

    // Switch (parse true/false)
    attachUpdateCallbackToSwitch('staticsite', 'static-site-config', token);

    // UI-config (include value in previous object config)
    attachUpdateCallbackToUIConfig(token);
}