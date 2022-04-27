import {API_URL, get, post} from "../api/api";
import openSnackBar from "../components/snackbar";
import openPopup from "../components/popup";

/**
 * Messages to prefix success/error messages
 * @type {{reboot: string, unmountusb: string, reset: string, shutdown: string,courseusb: string, openwellusb: string}}
 */
const messages = {
	openwellusb:'Loading Content From USB',
	openwellrefresh:'Refreshing Missing Content For OpenWell',
    unmountusb:'Unmounting USB',
    shutdown:'System shutdown',
    reboot:'System reboot',
    reset:'System reset',
    sync:'Sync With Server'
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
	console.log(`attachSystemScript: ${id}-button`);
    button.addEventListener('click', () => {
   		openSnackBar('Processing...','success');
        get(`${API_URL}do/${id}`,token,()=>successCallback(id), (code)=>errorCallback(id, code))
    })
}

/**
 * Attach all API to buttons of system section
 * @param token the token to authenticate the requests
 */
export default function attachSystemScripts(token){
    attachSystemScript('openwellusb', token);
    attachSystemScript('openwellrefresh', token);
    attachSystemScript('shutdown', token);
    attachSystemScript('reboot', token);
    attachSystemScript('sync', token);
    //attachSystemScript('reset', token);
}