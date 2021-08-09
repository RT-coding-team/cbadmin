import './components/custom-accordion'
import './components/custom-switch'

import logout from "./admin/logout";
import load from "./admin/load";

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
 */
window.addEventListener('load', () => load(token))