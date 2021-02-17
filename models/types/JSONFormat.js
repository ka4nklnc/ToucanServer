"use strict";
let random = require("../../socket/helpers/randomHelper");

/**
 *
 * @param {String} data
 * @param {Number} errorCode
 * @param {Boolean} state
 */
module.exports.JSONSuccessFormat = function(data = "", path = "") {
    this.mUid = random.randomString(100);
    this.data = data;
    this.state = true;
    this.errorCode = -1;
    this.path = path;
    return JSON.stringify(this);
};

module.exports.JSONErrorFormat = function(
    errorCode = -1,
    path = "",
    state = false
) {
    this.mUid = random.randomString(100);
    this.data = "";
    this.state = state;
    this.errorCode = errorCode;
    this.path = path;

    return JSON.stringify(this);
};
/**
 *
 * @param {*} data
 * @param {*} errorCode
 * @param {*} path
 * @param {*} state false = error , true = success
 */
module.exports.JSONFormat = function(
    data = "",
    errorCode = -1,
    path = "",
    state = false
) {
    this.mUid = random.randomString(100);
    this.data = data;
    this.state = state;
    this.errorCode = errorCode;
    this.path = path;

    return JSON.stringify(this);
};

module.exports.JSONFormatManualmUid = function(
    mUid = "",
    data = "",
    errorCode = -1,
    path = "",
    state = false
) {
    this.mUid = mUid;
    this.data = data;
    this.state = state;
    this.errorCode = errorCode;
    this.path = path;

    return JSON.stringify(this);
};