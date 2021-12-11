import {API_URL, post} from "../api/api";
import openSnackBar from "../components/snackbar";
import openPopup from "../components/popup";

/**
 * Messages to prefix success/error messages
 * @type {{reboot: string, unmountusb: string, reset: string, shutdown: string}}
 */
const messages = {
    unmountusb:'Unmounting USB',
    shutdown:'System shutdown',
    reboot:'System reboot',
    reset:'System reset',
}

/**
 * Open a snackbar and display a success message
 * @param name the updated field
 */
function successCallback(id) {
    openPopup('Success', `${messages[id]} successfully initiated`, );
}

/**
 * Open a snackbar and display an error message
 * @param name the updated field
 */
function errorCallback(id, code) {
    if(code === 401) window.location.href = "/admin/login.html";
    openSnackBar(`${messages[id]} not initiated`, 'error');
}

/**
 * Connect a button with id ':id-button' to API call for system script
 * @param id the prefix of button id
 * @param token the token to authenticate the request
 */
function attachSystemScript(id, token) {
    const button = document.getElementById(`${id}-button`)

    button.addEventListener('click', () => {
        post(`${API_URL}system`,token,{value:id},()=>successCallback(id), (code)=>errorCallback(id, code))
    })
}

/**
 * Attach all API to buttons of system section
 * @param token the token to authenticate the requests
 */
export default function attachSystemScripts(token){
    attachSystemScript('unmountusb', token);
    attachSystemScript('shutdown', token);
    attachSystemScript('reboot', token);
    attachSystemScript('reset', token);
}