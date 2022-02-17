import {API_URL, get} from "../api/api";
/**
 * Forget token and send back user to login page
 * @param setToken
 */
export default function logout(setToken) {
    setToken(null);
    localStorage.removeItem('admin-authorization');
    get(`${API_URL}logout`);
    window.location = "/admin/login.html";
}