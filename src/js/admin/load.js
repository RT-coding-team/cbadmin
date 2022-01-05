import {API_URL, get} from "../api/api";
import openSnackBar from "../components/snackbar";

/**
 * Helper to activate a switch at the beginning
 *
 * @param id the base id of the switch to activate
 */
function activateSwitch(id) {
    const classNames = document.getElementById(`${id}-switch`).className
        .split(' ')
        .filter(className => className !== "form-checkbox-div--unchecked");
    document.getElementById(`${id}-switch`).className = [...classNames, 'form-checkbox-div--checked'].join(' ');
    document.getElementById(`${id}-input`).checked = true;
}

/**
 * When there is an error, show a message in the top
 */
function errorCallback(code) {
    if (code === 401) window.location.href = "/admin/login.html";
    openSnackBar('Unknown error occurred. Please try later', 'error');
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
 * Renderer to activate a switch if value is the string "1"
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function switchRenderer(element, value) {
    if (value === '"1"') activateSwitch(element.id);
    if (value === '1') activateSwitch(element.id); // Added by DM 20220104 to handle integer values in the brand.txt
}

/**
 * Renderer to parse a JSON to a string and set it as a value to a text input
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function stringParserRenderer(element, prop) {
    try {
        const parsedProp = JSON.parse(prop)
        element.value = parsedProp || "";
    } catch (e) {
        element.value = "";
    }
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
	    console.log(`Getting: ${id} -- ${name}: ${prop});
        renderer(element, prop);
    }
    get(`${API_URL}${name}`, token, successCallback, errorCallback);
}

/**
 * Get Screen_Enable from server, and activate (or not) corresponding screens switches
 *
 * @param token the authorization token
 */
function getScreenEnable(token) {
    const successCallback = (prop) => {
        try {
            const pages = JSON.parse(prop);
            if (pages[0])
                activateSwitch("screen_enable_main_page");
            if (pages[1])
                activateSwitch("screen_enable_info_page");
            if (pages[2])
                activateSwitch("screen_enable_battery_page");
            if (pages[3])
                activateSwitch("screen_enable_battery_details_page");
            if (pages[4])
                activateSwitch("screen_enable_memory_page");
            if (pages.slice(5, 13).every(x => x))
                activateSwitch("screen_enable_stats_pages");
            if (pages[13])
                activateSwitch("screen_enable_admin_pages");
        } catch (e) {
            console.log(e);
        }
    }
    get(`${API_URL}brand/Screen_Enable`, token, successCallback, errorCallback);
}

/**
 * Get all readable params and set values of inputs
 *
 * @param token the authorization token
 */
export default function (token) {
    getProperty('ssid-input', 'ssid', token);
    getProperty('wpa-passphrase-input', 'wpa-passphrase', token);

    getProperty('server_url-input', 'brand/server_url', token, stringParserRenderer);
    getProperty('server_sitename-input', 'brand/server_sitename', token, stringParserRenderer);
    getProperty('server_siteadmin_name-input', 'brand/server_siteadmin_name', token, stringParserRenderer);
    getProperty('server_siteadmin_email-input', 'brand/server_siteadmin_email', token, stringParserRenderer);
    getProperty('server_siteadmin_phone-input', 'brand/server_siteadmin_phone', token, stringParserRenderer);
//    getProperty('openwell-download-input', 'openwell-download', token, stringParserRenderer);
//    getProperty('moodle_download-input', 'moodle_download', token, stringParserRenderer);

    getProperty('usb0NoMount', 'brand/usb0NoMount', token, switchRenderer);
    getProperty('enhanced', 'brand/enhanced', token, switchRenderer);

    getProperty('client-ssid-input', 'client-ssid', token);
    getProperty('channel-input', 'channel', token);
    getProperty('hostname-input', 'hostname', token);

	// Added 20220104 to use keys for LCD pages rather than array
	getProperty('lcd_pages_main','brand/lcd_pages_main', token, switchRenderer);
	getProperty('lcd_pages_info','brand/lcd_pages_info', token, switchRenderer);
	getProperty('lcd_pages_battery','brand/lcd_pages_battery', token, switchRenderer);
	getProperty('lcd_pages_multi_bat','brand/lcd_pages_multi_bat', token, switchRenderer);
	getProperty('lcd_pages_memory','brand/lcd_pages_memory', token, switchRenderer);
	getProperty('lcd_pages_stats','brand/lcd_pages_stats', token, switchRenderer);
	getProperty('lcd_pages_admin','brand/lcd_pages_admin', token, switchRenderer);

    //getScreenEnable(token);  //todo removed for using getProperty for screen enable
}

