const openButtons = document.getElementsByClassName('btn-open-form');
for (let i = 0; i < openButtons.length | 0; i++) {
    const id = openButtons[i].getAttribute('data-input-name');
    const contentBlocks = openButtons[i].parentElement.parentElement.parentElement.getElementsByClassName('form-accordion-content');
    const saveButtons = openButtons[i].parentElement.parentElement.parentElement.getElementsByClassName('button-save');

    openButtons[i].addEventListener('click', () => {
        for (let j = 0; j < contentBlocks.length; j++)
            contentBlocks[j].style.display = "block";
        for (let j = 0; j < saveButtons.length; j++)
            saveButtons[j].style.display = "block";

        document.getElementById(`btn-open-form-${id}`).style.display = 'none';
        document.getElementById(`btn-close-form-${id}`).style.display = 'block';

    })
}
const closeButtons = document.getElementsByClassName('btn-close-form');
for (let i = 0; i < closeButtons.length | 0; i++) {
    const id = closeButtons[i].getAttribute('data-input-name');
    const contentBlocks = openButtons[i].parentElement.parentElement.parentElement.getElementsByClassName('form-accordion-content');
    const saveButtons = openButtons[i].parentElement.parentElement.parentElement.getElementsByClassName('button-save');

    closeButtons[i].addEventListener('click', () => {
        for (let j = 0; j < contentBlocks.length; j++)
            contentBlocks[j].style.display = "none";
        for (let j = 0; j < saveButtons.length; j++)
            saveButtons[j].style.display = "none";

        document.getElementById(`btn-open-form-${id}`).style.display = 'block';
        document.getElementById(`btn-close-form-${id}`).style.display = 'none';
    })
}