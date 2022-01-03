/**
 * Open a popup with a title and a content
 * @param title the title
 * @param message the content of the snackbar
 */
export default function openPopup(title, message) {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup-title').innerText = title;
    document.getElementById('popup-content').innerText = message;
}
