/**
 * Open a snackbar in the bottom, with a message and a severity
 * @param message the content of the snackbar
 * @param severity one of "error", "success" to change the color
 */
export default function openSnackBar(message, severity) {
    const snackBar = document.getElementById('message-error');
    snackBar.children[0].innerText = message;
    snackBar.className = `snackbar snackbar--shown snackbar--${severity}`;
    setTimeout(() => {
        snackBar.className = `snackbar snackbar--hidden snackbar--${severity}`;
    }, 3000);
}