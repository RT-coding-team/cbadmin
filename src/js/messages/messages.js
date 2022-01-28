const successMessages = {
    "openwell-download": "Downloading & Installing Now",
    "course-download": "Downloading & Installing Now",
    "wap": "SSID, Channel and wpa-passphrase have been successfully updated",
    "client_wifi": "SSID, Password and country code have been successfully updated",
}

export const successMessage = (name) => {
    if (successMessages[name]) return successMessages[name];
    return `${name} has been updated`;
}