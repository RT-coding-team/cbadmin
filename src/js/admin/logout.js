export default function logout(setToken) {
    setToken(null);
    localStorage.removeItem('admin-authorization');
    window.location = "/login.html";
}