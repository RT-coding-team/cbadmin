import {API_URL, get} from "./api/api";
import str2B64 from "./utils/utf8";

function login(e) {
    e.preventDefault()
    const password = document.getElementById('password').value;
    const token = str2B64(`admin:${password}`);

    const successCallback = () => {
        localStorage.setItem('admin-authorization', token);
        window.location = '/admin.html';
    }
    const errorCallback = (status) => {
        const errorMessage = document.getElementById('message-error')
        if (status === 401) errorMessage.innerText = 'Invalid password'
        else errorMessage.innerText = 'Unknown error occurred. Please try later'
    }

    get(`${API_URL}ui-config`, token, successCallback, errorCallback);
}

document.getElementById('loginForm').addEventListener('submit', login);
