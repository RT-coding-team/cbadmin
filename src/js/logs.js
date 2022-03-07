import {API_URL, get} from "./api/api";

// Populate the title
var logRequested = window.location.hash.substr(1);
console.log(`Getting: ${logRequested}`);
var titleElement = document.getElementById('title');
titleElement.textContent += logRequested;

// Populate the data
var element = document.getElementById('logsArea');
const successCallback = (data) => {
	var html = '';
	for (var key of Object.keys(data)) {
		console.log(key);
		html += `<h1>${key}</h1>${data[key].replace(/\n/g,'<BR>\n')}\n<HR>\n`;
	}
	element.innerHTML = html;
}
const errorCallback = (status) => {
	element.textContent = 'Unable to Retrieve Logs'
}

if (logRequested === 'wifistatus') {
    get(`${API_URL}wifistatus`, `Basic Null`, successCallback, errorCallback);
}
else {
    get(`${API_URL}logs/${logRequested}`, `Basic Null`, successCallback, errorCallback);

}