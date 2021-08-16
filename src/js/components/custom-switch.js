/**
 * Get all switches of the page and attach their callbacks : synchronize the input checkbox and the visible switch
 */
const switches = document.getElementsByClassName('form-checkbox-div');
for (let i = 0; i < switches.length | 0; i++) {
    const id = switches[i].getAttribute('data-input-name');
    const input = document.getElementById(`${id}-input`);
    switches[i].addEventListener('click', () => {
        const classNames = switches[i].className
            .split(' ')
            .filter(className => className !== "form-checkbox-div--checked" && className !== "form-checkbox-div--unchecked");
        if (input.checked) {
            classNames.push('form-checkbox-div--unchecked')
            input.checked = false
        } else {
            classNames.push('form-checkbox-div--checked')
            input.checked = true
        }
        switches[i].className = classNames.join(' ');
    })
}