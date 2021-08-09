import './components/custom-accordion'
import './components/custom-switch'

let token;

if(!localStorage.getItem('admin-authorization'))
    window.location = "/login.html";
else
    token = localStorage.getItem('admin-authorization');

function logout() {
    token = null;
    localStorage.removeItem('admin-authorization');
    window.location = "/login.html";
}
document.getElementById('logout').addEventListener('click', logout)