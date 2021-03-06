export const API_URL = `/admin/api/`;
export const ASSETS_URL = `/__connectbox_assets__/`;

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

        callbackSuccess(res?.result !== undefined ? res.result : res);
    } catch (e) {
        console.log(e)
        callbackError(req.status, req.responseText);
    }
}

/**
 * Send a delete request and parse result
 * @param url the url where to send the request (to the API)
 * @param token to authenticate the request
 * @param callback the callback if request succeed
 * @param callbackError the callback if request (or parsing) fail
 */
export function del(url, token, callback, callbackError = console.error) {
    const oReq = new XMLHttpRequest();
    oReq.onload = () => {
        analyseResponse(oReq, callback, callbackError)
    }
    oReq.open('delete', url, true);
    if (token)
        oReq.setRequestHeader('Authorization', token);
    oReq.send();
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
        oReq.setRequestHeader('Authorization', token);
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
    oReq.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
    oReq.setRequestHeader('Authorization', token);
    oReq.send(JSON.stringify(payload))
}


/**
 * Send a post request and parse result
 *
 * @param url the url where to send the request (to the API)
 * @param token to authenticate the request
 * @param payload the content
 * @param callback the callback if request succeed
 * @param callbackError the callback if request (or parsing) fail
 */
export function post(url, token, payload, callback, callbackError = console.error) {
    const oReq = new XMLHttpRequest();
    oReq.onload = () => {
        analyseResponse(oReq, callback, callbackError);
    }
    oReq.open("post", url, true);
    oReq.setRequestHeader('Authorization', token);
    oReq.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
    oReq.send(JSON.stringify(payload))
}
