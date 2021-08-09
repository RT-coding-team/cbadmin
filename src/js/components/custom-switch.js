const switches = document.getElementsByClassName('form-checkbox-div');
for (let i = 0; i < switches.length | 0; i++) {
    const id = switches[i].getAttribute('data-input-name');
    switches[i].addEventListener('click', () => {
        console.log(document.getElementById(id).checked)
        const classNames = switches[i].className
            .split(' ')
            .filter(className => className !== "form-checkbox-div--checked" && className !== "form-checkbox-div--unchecked");
        if (document.getElementById(id).checked) {
            classNames.push('form-checkbox-div--unchecked')
            document.getElementById(id).checked = false
        } else {
            classNames.push('form-checkbox-div--checked')
            document.getElementById(id).checked = true
        }
        switches[i].className = classNames.join(' ');
    })
}