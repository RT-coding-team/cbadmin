import './components/custom-accordion'
import './components/custom-switch'

import logout from "./admin/logout";
import load from "./admin/load";
import attachUpdateCallbacks from "./admin/update";
import initReports from "./admin/reports";

/**
 * State
 */
let token;
function setToken(nToken) {
    token = nToken
}

/**
 * Store token in memory or redirect
 */
const storedToken = localStorage.getItem('admin-authorization')
if (!storedToken) window.location = "/login.html";
else setToken(storedToken);

/**
 * Attach logout to its button
 */
document.getElementById('logout').addEventListener('click', () => logout(setToken))

/**
 * Load current configuration when loaded
 * Attach callbacks to send modifications
 * Init reports (load and attach controls)
 */
window.addEventListener('load', () => {
    load(token);
    attachUpdateCallbacks(token);
    initReports(token)
})
