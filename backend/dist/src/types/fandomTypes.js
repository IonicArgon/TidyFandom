"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FandomStatus = void 0;
var FandomStatus;
(function (FandomStatus) {
    FandomStatus["SUCCESS"] = "success";
    FandomStatus["PROCESSING"] = "processing";
    FandomStatus["ERROR_MALFORMED_REQUEST"] = "error_malformed_request";
    FandomStatus["ERROR_INVALID_WIKI"] = "error_invalid_wiki";
    FandomStatus["ERROR_INVALID_PAGE"] = "error_invalid_page";
    FandomStatus["ERROR_NOT_FOUND"] = "error_not_found";
    FandomStatus["ERROR_ALREADY_EXISTS"] = "error_already_exists";
    FandomStatus["ERROR_UNKNOWN"] = "error_unknown";
})(FandomStatus || (exports.FandomStatus = FandomStatus = {}));
