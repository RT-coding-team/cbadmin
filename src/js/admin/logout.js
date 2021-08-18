/**
 * Forget token and send back user to login page
 * @param setToken
 */
export default function logout(setToken) {
    setToken(null);
    localStorage.removeItem('admin-authorization');
    window.location = "/admin/login.html";
}