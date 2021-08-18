export const API_URL = `http://dev-apps.thewellcloud.cloud/admin/api/`;
export const ASSETS_URL = `http://dev-apps.thewellcloud.cloud/__connectbox_assets__/`;

/**
 * Analyse a completed request to detect errors (and call error callback), or continue (and call success callback)
 *
 * @param req the completed request to analyse
 * @param callbackSuccess  the callback if request succeed
 * @param callbackError  the callback if request (or parsing) fail
 * @returns {*}
 */
function analyseResponse(req, callbackSuccess, callbackError) {
    if (req.status !== 201 && req.status !== 200)
        return callbackError(req.status, req.responseText);
    try {
        const res = JSON.parse(req.responseText);
        if (res.code && res.code !== 0) return callbackError(req.status, req.responseText);

        callbackSuccess(res?.result?.[0] !== undefined ? res.result[0] : res);
    } catch (e) {
        console.error(e)
        callbackError(req.status, req.responseText);
    }
}

/**
 * Send a get request and parse result
 * @param url the url where to send the request (to the API)
 * @param token to authenticate the request
 * @param callback the callback if request succeed
 * @param callbackError the callback if request (or parsing) fail
 */
export function get(url, token, callback, callbackError = console.error) {
    const oReq = new XMLHttpRequest();
    oReq.onload = () => {
        analyseResponse(oReq, callback, callbackError)
    }
    oReq.open("get", url, true);
    if (token)
        oReq.setRequestHeader('Authorization', `Basic ${token}`);
    oReq.send();
}

/**
 * Send a put request and parse result
 *
 * @param url the url where to send the request (to the API)
 * @param token to authenticate the request
 * @param payload the new content
 * @param callback the callback if request succeed
 * @param callbackError the callback if request (or parsing) fail
 */
export function put(url, token, payload, callback, callbackError = console.error) {
    const oReq = new XMLHttpRequest();
    oReq.onload = () => {
        analyseResponse(oReq, callback, callbackError);
    }
    oReq.open("put", url, true);
    oReq.setRequestHeader('Authorization', `Basic ${token}`);
    oReq.send(JSON.stringify(payload))
}