import {API_URL, get} from "./api/api";
import str2B64 from "./utils/utf8";

function login(e) {
    e.preventDefault()
    const password = document.getElementById('password').value;
    const token = str2B64(`admin:${password}`);

    const successCallback = () => {
        localStorage.setItem('admin-authorization', `Basic ${token}`);
        window.location = '/admin';
    }
    const errorCallback = (status) => {
        const errorMessage = document.getElementById('message-error')
        if (status === 401) errorMessage.innerText = 'Invalid password'
        else errorMessage.innerText = 'Unable to Connect To Database'
    }

    get(`${API_URL}ui-config`, `Basic ${token}`, successCallback, errorCallback);
}

document.getElementById('loginForm').addEventListener('submit', login);
