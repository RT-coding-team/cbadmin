import {API_URL, del, get} from "../api/api";
import openSnackBar from "../components/snackbar";

/**
 * Helper to activate a switch at the beginning
 *
 * @param id the base id of the switch to activate
 */
function activateSwitch(id) {
    const classNames = document.getElementById(`${id}-switch`).className
        .split(' ')
        .filter(className => className !== "form-checkbox-div--unchecked");
    document.getElementById(`${id}-switch`).className = [...classNames, 'form-checkbox-div--checked'].join(' ');
    document.getElementById(`${id}-input`).checked = true;
}

/**
 * Clear the selector of all options but the first.
 *
 * @param  {object} selector    The selector you want to clear
 * @return {void}
 */
function clearSelector(selector) {
    const options = selector.querySelectorAll('option');
    options.forEach((option, i)    =>  {
        if (i > 0) {
            option.remove();
        }
    });
}

/**
 * When there is an error, show a message in the top
 */
function errorCallback(code,error) {
console.log(code,error);
    if (code === 401) window.location.href = "/admin/login.html";
    openSnackBar(`Unable to Retrieve From Database: ${error}`);
}

/**
 * By default, when a config element is loaded, set the value of the element equal to the value from the server.
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function defaultRenderer(element, value) {
    element.value = value
}

/**
 * Renderer to activate a switch if value is the string "1"
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function switchRenderer(element, value) {
    const state = value[0];
    if (state == '"1"' || state == '1' || state == 1) activateSwitch(element.id); // Added by DM 20220104 to handle integer values in the brand.txt
    else if (state === 'none' || (state != '"0"' && state != '0' && state != 0)) {  // Added by DM 20220128 to handle OTG
		console.log('Hiding Element:' + element.id);
		var element = document.getElementById(element.id)
		element.classList.add('hidden');
    }
}

/**
 * Renderer to populate <select> with the default
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function listRenderer(element, array) {
	for (var value of array) {
		var option = document.createElement("option");
		option.value = value;
		option.text = value;
		element.appendChild(option);
	}
}

/**
 * Renderer to populate <select> with the default
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function selectRenderer(element, value) {
	if (value === 'none') {
		console.log('Hiding Element:' + element.id);
		var element = document.getElementById(element.id)
		element.classList.add('hidden');
	}
	else {
		element.value = value;
	}
}

/**
 * Renderer to populate <select> with the default
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function wifiScanRenderer(element, value) {
	var encText = {true:"Password Required",false:"No Password"}
	for (var record of value) {
		var option = document.createElement("option");
		option.value = record.ssid;
		option.text = `${record.ssid}:     (${encText[record.encryption]})`;
		element.appendChild(option);
	}
}

/**
 * Renderer to populate <select> with the default
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function subscriptionsRenderer(element, array) {
	for (var value of array) {
		var option = document.createElement("option");
		option.value = value.value;
		option.text = value.name;
		if (value.isSelected) {
			option.selected = true;
		}
		element.appendChild(option);
	}
}

/**
 * Renderer to parse a JSON to a string and set it as a value to a text input
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function stringParserRenderer(element, prop) {
    try {
        const parsedProp = JSON.parse(prop)
        element.value = parsedProp || "";
    } catch (e) {
        element.value = prop;
    }
}

/**
 * Renderer to parse a JSON to a text block
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function textRenderer(element, prop) {
	element.innerHTML = element.innerHTML + prop;
}

/**
 * Renderer to parse a JSON to a text block
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function logSourcesRenderer(element, prop) {
	var html = ''
	for (var key of prop) {
		html += `<a href="/admin/logs.html#${key}" target=logs>${key}</a><BR>`;
	}
	element.innerHTML = html;
}

/**
 * Renderer to parse if Moodle and hide/show elements as needed
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function isMoodleRenderer(element, value) {
	var isMoodle = false;
	if (value == "1") {
		isMoodle = true;
	}
	console.log('Moodle Value is ' + isMoodle);
	if (isMoodle) {
		var elements = document.getElementsByClassName('withMoodle')
		for (var element of elements) {
			console.log('Showing Element Used With Moodle: ' + element.id)
			var item = document.getElementById(element.id)
			item.classList.remove('hidden');
		}
	}
	else {
		var elements = document.getElementsByClassName('noMoodle')
		for (var element of elements) {
			console.log('Showing Element Not Used With Moodle: ' + element.id)
			var item = document.getElementById(element.id)
			item.classList.remove('hidden');
		}
	}
}

/**
 * Renderer for the LMS course select box
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function lmsCourseSelectRender(element, value) {
    clearSelector(element);
    value
        .sort((a, b)   =>  {
            const la = a.fullname.toLowerCase();
            const lb = b.fullname.toLowerCase();
            if (la < lb) {
                return -1;
            }
            if (la > lb) {
                return 1;
            }
            return 0;
        })
        .forEach((course) =>  {
            const option = document.createElement('option');
            option.text = course.fullname;
            option.value = course.id;
            element.appendChild(option);
        });
}

/**
 * Renderer for the LMS user select box
 *
 * @param element the input element to set
 * @param value the value from the server
 */
function lmsUserSelectRender(element, value) {
    if (!('users' in value)) {
        console.error('No users were found!', value);
    }
    clearSelector(element);
    const users = value.users;
    users
        .sort((a, b)   =>  {
            const la = a.fullname.toLowerCase();
            const lb = b.fullname.toLowerCase();
            if (la < lb) {
                return -1;
            }
            if (la > lb) {
                return 1;
            }
            return 0;
        })
        .forEach((user) =>  {
            const option = document.createElement('option');
            option.text = user.fullname;
            option.value = user.id;
            element.appendChild(option);
        });
}

/**
 * Set up events for all the LMS functionality
 *
 * @return {void}
 */
function lmsSetUpEvents(token) {
    // LMS Update User
    const userSelect = document.getElementById('moodle_users-input');
    const wrapper = document.getElementById('moodle_users-update-form');
    const userSuccessCallback = (data) => {
        const user = data[0];
        document.getElementById('moodle_update_username-input').value = user.username;
        document.getElementById('moodle_update_firstname-input').value = user.firstname;
        document.getElementById('moodle_update_lastname-input').value = user.lastname;
        document.getElementById('moodle_update_email-input').value = user.email;
        document.getElementById('moodle_update_user_id-input').value = user.id;
        wrapper.classList.remove('d-none');
    };
    userSelect.addEventListener('change', ()  =>  {
        const userId = userSelect.value;
        if (userId) {
            get(`${API_URL}/lms/users/${userId}`, token, userSuccessCallback, errorCallback);
        } else {
            wrapper.classList.add('d-none');
            document.getElementById('moodle_update_username-input').value = '';
            document.getElementById('moodle_update_firstname-input').value = '';
            document.getElementById('moodle_update_lastname-input').value = '';
            document.getElementById('moodle_update_email-input').value = '';
            document.getElementById('moodle_update_user_id-input').value = '';
        }
    });
    // Delete user on update form
    const deleteButton = document.getElementById('moodle_users_account_remove-remove');
    const loader = document.getElementById('moodle_users_account_remove-loader');
    const deleteSuccessCallback = (data)    =>  {
        wrapper.classList.add('d-none');
        getProperty('moodle_users-input', 'lms/users', token, lmsUserSelectRender);
        loader.display = 'none';;
        deleteButton.classList.remove('d-none');
    };
    deleteButton.addEventListener('click', (event)   =>  {
        event.stopPropagation();
        const id = document.getElementById('moodle_update_user_id-input').value;
        const username = document.getElementById('moodle_update_username-input').value;
        if (!id) {
            return false;
        }
        if (confirm(`Are you sure you want to delete the account: ${username}?`)) {
            loader.display = 'block';
            deleteButton.classList.add('d-none');
            del(`${API_URL}/lms/users/${id}`, token, deleteSuccessCallback, errorCallback);
        }
        return false;
    });
    // Course Functions
    const courseSelect = document.getElementById('moodle_courses-input');
    const list = document.getElementById('course-users-list');
    const courseSuccessCallback = (data) => {
        list.innerHTML = '';
        if (data.length == 0) {
            const li = document.createElement('li');
            li.innerHTML = 'Sorry, no users found.';
            list.appendChild(li);
            return;
        }
        data
            .sort((a, b)   =>  {
                const la = a.fullname.toLowerCase();
                const lb = b.fullname.toLowerCase();
                if (la < lb) {
                    return -1;
                }
                if (la > lb) {
                    return 1;
                }
                return 0;
            })
            .forEach((user) =>  {
                const li = document.createElement('li');
                const roles = user.roles.map((role) =>  role.shortname);
                const roleText = (roles.length > 0) ? ` (${roles.join(', ')})` : '';
                li.innerHTML = `${user.fullname}${roleText}`;
                list.appendChild(li);
            });
    }
    courseSelect.addEventListener('change', ()  =>  {
        const courseId = courseSelect.value;
        if (courseId) {
            get(`${API_URL}/lms/courses/${courseId}/users`, token, courseSuccessCallback, errorCallback);
        } else {
            list.innerHTML = '';
        }
    });
}

/**
 * Get the value of a parameter from the server, and set initial value of inputs to this value
 * @param id the id of the input
 * @param name the name of the parameter (server)
 * @param token the authorization token
 * @param renderer (optional) a custom function to set value of input, if defaultRenderer is not suitable
 */
function getProperty(id, name, token, renderer = defaultRenderer) {
    const successCallback = (prop) => {
        const element = document.getElementById(id);
	    console.log(`Getting: ${id} -- ${name}: ${prop}`);
        renderer(element, prop);
    }
    get(`${API_URL}${name}`, token, successCallback, errorCallback);
}

/**
 * Get Screen_Enable from server, and activate (or not) corresponding screens switches
 *
 * @param token the authorization token
 */
function getScreenEnable(token) {
    const successCallback = (prop) => {
        try {
            const pages = JSON.parse(prop);
            if (pages[0])
                activateSwitch("screen_enable_main_page");
            if (pages[1])
                activateSwitch("screen_enable_info_page");
            if (pages[2])
                activateSwitch("screen_enable_battery_page");
            if (pages[3])
                activateSwitch("screen_enable_battery_details_page");
            if (pages[4])
                activateSwitch("screen_enable_memory_page");
            if (pages.slice(5, 13).every(x => x))
                activateSwitch("screen_enable_stats_pages");
            if (pages[13])
                activateSwitch("screen_enable_admin_pages");
        } catch (e) {
            console.log(e);
        }
    }
    get(`${API_URL}brand/Screen_Enable`, token, successCallback, errorCallback);
}

/**
 * Get all readable params and set values of inputs
 *
 * @param token the authorization token
 */
export default function (token) {
    getProperty('ssid-input', 'apssid', token);
    getProperty('wpa-passphrase-input', 'appassphrase', token);
    getProperty('channel-input', 'apchannel', token);
    getProperty('clientwificonnection', 'clientwificonnection', token, textRenderer);
    getProperty('connectedclients', 'connectedclients', token, textRenderer);
    getProperty('logsources', 'logsources', token, logSourcesRenderer);

    getProperty('server_url-input', 'brand/server_url', token, stringParserRenderer);
    getProperty('server_sitename-input', 'brand/server_sitename', token, stringParserRenderer);
    getProperty('server_authorization-input', 'brand/server_authorization', token, stringParserRenderer);
    getProperty('server_siteadmin_name-input', 'brand/server_siteadmin_name', token, stringParserRenderer);
    getProperty('server_siteadmin_email-input', 'brand/server_siteadmin_email', token, stringParserRenderer);
    getProperty('server_siteadmin_phone-input', 'brand/server_siteadmin_phone', token, stringParserRenderer);
    getProperty('server_siteadmin_country-input', 'brand/server_siteadmin_country', token, stringParserRenderer);

	getProperty('disable_chat','disable_chat', token, switchRenderer);
	getProperty('disable_stats','disable_stats', token, switchRenderer);

    getProperty('otg_enable-input','brand/otg_enable', token, selectRenderer);
    getProperty('g_device-input', 'brand/g_device', token, stringParserRenderer);
    getProperty('enable_mass_storage-input', 'brand/enable_mass_storage', token, stringParserRenderer);

    getProperty("is-moodle", 'ismoodle', token, isMoodleRenderer)
	getProperty('courseusb-input','coursesonusb', token, listRenderer);
	getProperty('subscribe-input','subscriptions', token, subscriptionsRenderer);

    getProperty('usb0nomount', 'brand/usb0nomount', token, switchRenderer);

	getProperty('client-wifiscan-input','clientwifiscan', token, wifiScanRenderer);
    getProperty('client-ssid-input', 'clientssid', token);
    getProperty('client-wifipassword-input', 'clientpassphrase', token);
    getProperty('client-wificountry-input', 'clientcountry', token);
    getProperty('hostname-input', 'hostname', token);

	// Added 20220104 to use keys for LCD pages rather than array
	getProperty('lcd_pages_main','brand/lcd_pages_main', token, switchRenderer);
	getProperty('lcd_pages_info','brand/lcd_pages_info', token, switchRenderer);
	getProperty('lcd_pages_battery','brand/lcd_pages_battery', token, switchRenderer);
	getProperty('lcd_pages_multi_bat','brand/lcd_pages_multi_bat', token, switchRenderer);
	getProperty('lcd_pages_memory','brand/lcd_pages_memory', token, switchRenderer);
	getProperty('lcd_pages_stats','brand/lcd_pages_stats', token, switchRenderer);
	getProperty('lcd_pages_admin','brand/lcd_pages_admin', token, switchRenderer);

    getProperty('moodle_users-input', 'lms/users', token, lmsUserSelectRender);
    getProperty('moodle_courses-input', 'lms/courses', token, lmsCourseSelectRender);
    getProperty('moodle_courses_functions-input', 'lms/courses', token, lmsCourseSelectRender);
    lmsSetUpEvents(token);
    //getScreenEnable(token);  //todo removed for using getProperty for screen enable
}
