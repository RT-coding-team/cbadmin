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
    openSnackBar(`${messages[id]} failed`, 'error');
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
 * Enable the advance options
 *
 * @return {void}
 */
function enableAdvancedOptions() {
	openSnackBar('Enabling Advanced Options','success');
	console.log("Enabling Advanced Options -- show hidden regions");
	var elements = document.getElementsByClassName('isAdvanced');
	for (var element of elements) {
		element.classList.remove('hidden');
	}
}
function attachAdvanced(id,token) {
    const button = document.getElementById(`${id}-button`)
		console.log(`attachSystemScript: ${id}-button`);
    button.addEventListener('click', () => {
			const popup = document.getElementById('popup-sign-in');
			popup.style.display = 'block';
			// enableAdvancedOptions();
		});
}
/**
 * Attach common popup events
 *
 * @return {void}
 */
function attachPopup() {
	/**
	 * Any elements that have a class popup-close-trigger will close the popup.
	 * Simply add a data-popup tag with the id of the popup to close
	 */
	const elements = document.getElementsByClassName('popup-close-trigger');
	for (const element of elements) {
		element.addEventListener('click', (event) => {
			const target = event.target || event.srcElement;
			document.getElementById(target.dataset.popup).style.display = 'none';
		});
	}
}
/**
 * Attach sign in callbacks
 *
 * @return {void}
 */
function attachSignIn() {
	const submit = document.querySelector('#popup-sign-in .check-login');
	submit.addEventListener('click', (event) => {
		const target = event.target || event.srcElement;
		const popup = document.getElementById('popup-sign-in');
		const input = popup.querySelector('input.password');
		if (input.value === '') {
			input.classList.add('has-error');
			return;
		}
		/**
		 * @TODO Check if password is valid
		 */
		input.classList.remove('has-error');
		popup.style.display = 'none';
		enableAdvancedOptions();
	});
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
    attachAdvanced('advanced', token);
		attachPopup();
		attachSignIn();
    //attachSystemScript('reset', token);
}
