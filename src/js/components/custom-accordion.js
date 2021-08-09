const openButtons = document.getElementsByClassName('btn-open-form');
for (let i = 0; i < openButtons.length | 0; i++) {
    const id = openButtons[i].getAttribute('data-input-name');
    openButtons[i].addEventListener('click', () => {
        document.getElementById(id).style.display = 'block';
        document.getElementById(`btn-open-form-${id}`).style.display = 'none';
        document.getElementById(`btn-close-form-${id}`).style.display = 'block';
    })
}
const closeButtons = document.getElementsByClassName('btn-close-form');
for (let i = 0; i < closeButtons.length | 0; i++) {
    const id = closeButtons[i].getAttribute('data-input-name');
    closeButtons[i].addEventListener('click', () => {
        document.getElementById(id).style.display = 'none';
        document.getElementById(`btn-open-form-${id}`).style.display = 'block';
        document.getElementById(`btn-close-form-${id}`).style.display = 'none';
    })
}