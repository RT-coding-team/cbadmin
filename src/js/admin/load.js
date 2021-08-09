import {API_URL, get} from "../api/api";

/**
 * When there is an error, show a message in the top
 */
function errorCallback () {
    const errorAlert = document.getElementById('message-error');
    errorAlert.children[0].innerText = 'Unknown error occurred. Please try later'
    errorAlert.className = 'alert alert--shown'
    setTimeout(() => {
        errorAlert.className = 'alert alert--hidden'
    }, 3000)
}

/**
 * By default, when a config element is loaded, set the value of the element equal to the value from the server.
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function defaultRenderer(element, value) {
    element.value = value
}

/**
 * Get the value of a parameter from the server, and set initial value of inputs to this value
 * @param id the id of the input
 * @param name the name of the parameter (server)
 * @param token the authorization token
 * @param renderer (optional) a custom function to set value of input, if defaultRenderer is not suitable
 */
function getProperty(id, name, token, renderer = defaultRenderer) {
    const successCallback = (prop) => {
        const element = document.getElementById(id);
        renderer(element, prop);
    }
    get(`${API_URL}${name}`, token, successCallback, errorCallback);
}

/**
 * Get all readable params and set values of inputs
 *
 * @param token the authorization token
 */
export default function (token) {
    getProperty('ssid-input', 'ssid', token);
    getProperty('channel-input', 'channel', token);
    getProperty('static-site-config-input', 'staticsite', token, (element, value) => {
        element.checked = value
    });
    getProperty('hostname-input', 'hostname', token);
    getProperty('banner-message-input', 'ui-config', token, (element, value) => {
        element.value = JSON.parse(value)?.Client?.banner || "";
        errorCallback();
    });
}

