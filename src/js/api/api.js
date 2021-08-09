export const API_URL = `http://dev-apps.thewellcloud.cloud/admin/api/`;

export function get(url, token, callback, callbackError = console.log) {
    const oReq = new XMLHttpRequest();
    oReq.onload = () => {
        if (oReq.status !== 201 && oReq.status !== 200)
            callbackError(oReq.status, oReq.responseText);
        else {
            try {
                callback(JSON.parse(oReq.responseText).result[0])
            } catch (e) {
                callbackError(oReq.status, oReq.responseText);
            }
        }
    }
    oReq.open("get", url, true);
    oReq.setRequestHeader('Authorization', `Basic ${token}`);
    oReq.send();
}