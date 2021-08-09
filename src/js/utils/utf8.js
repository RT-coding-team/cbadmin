/**
 * Utilities to convert utf-8 to base64 (password)
 *
 * Implementation from
 * https://developer.mozilla.org/fr/docs/Glossary/Base64#solution_.232_.e2.80.93_rewriting_atob()_and_btoa()_using_typedarrays_and_utf-8
 */

/**
 * Convert a 6-bit integer to base64 number
 * @param nUint6
 * @returns {number}
 */
function uint6ToB64 (nUint6) {
    if(nUint6 < 26) return nUint6 + 65
    if(nUint6 < 52) return nUint6 + 71
    if(nUint6 < 62) return nUint6 - 4
    if(nUint6 === 62) return 43
    if(nUint6 === 63) return 65
}

/**
 * Convert an array of Bytes representing utf-8 chars and encode it to base 64
 * @param aBytes array of Bytes
 * @returns {string}
 */
function base64EncArr (aBytes) {
    let nMod3 = 2, sB64Enc = "";
    for (let nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
        nMod3 = nIdx % 3;
        if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
        nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
        if (nMod3 === 2 || aBytes.length - nIdx === 1) {
            sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
            nUint24 = 0;
        }
    }
    return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');
}

/**
 * Convert a string from the DOM to an array of utf-8 Bytes
 * @param sDOMStr input string
 * @returns {Uint8Array}
 */
function strToUTF8Arr (sDOMStr) {
    let aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0;
    for (let nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
        nChr = sDOMStr.charCodeAt(nMapIdx);
        nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
    }
    aBytes = new Uint8Array(nArrLen);

    for (let nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
        nChr = sDOMStr.charCodeAt(nChrIdx);
        if (nChr < 128) {
            /* one byte */
            aBytes[nIdx++] = nChr;
        } else if (nChr < 0x800) {
            /* two bytes */
            aBytes[nIdx++] = 192 + (nChr >>> 6);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x10000) {
            /* three bytes */
            aBytes[nIdx++] = 224 + (nChr >>> 12);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x200000) {
            /* four bytes */
            aBytes[nIdx++] = 240 + (nChr >>> 18);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x4000000) {
            /* five bytes */
            aBytes[nIdx++] = 248 + (nChr >>> 24);
            aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else /* if (nChr <= 0x7fffffff) */ {
            /* six bytes */
            aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
            aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        }
    }
    return aBytes;
}

/**
 * Encode a string from the DOM (utf-8) to base64
 * @param str the input string
 * @returns {string} the encoded string
 */
export default function str2B64(str){
    return base64EncArr(strToUTF8Arr(str))
}
