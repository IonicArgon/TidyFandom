"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _FandomRequestHandler_cache;
Object.defineProperty(exports, "__esModule", { value: true });
// import stuff here
const fandomTypes_1 = require("../types/fandomTypes");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
class FandomRequestHandler {
    constructor(cache) {
        _FandomRequestHandler_cache.set(this, void 0);
        this.handleGet = async (req) => {
            const { wiki, page } = req.body;
            const key = `${wiki}/${page}`;
            const cachedResponse = __classPrivateFieldGet(this, _FandomRequestHandler_cache, "f").get(key);
            if (cachedResponse) {
                return Promise.resolve(cachedResponse);
            }
            else {
                return Promise.resolve({
                    content: "Cached content not found. Please send a POST request.",
                    status: fandomTypes_1.FandomStatus.ERROR_NOT_FOUND,
                });
            }
        };
        this.handlePost = async (req) => {
            const { wiki, page } = req.body;
            const key = `${wiki}/${page}`;
            const cachedResponse = __classPrivateFieldGet(this, _FandomRequestHandler_cache, "f").get(key);
            if (cachedResponse) {
                return Promise.resolve({
                    content: "Cached content already exists. Please send a GET request.",
                    status: fandomTypes_1.FandomStatus.ERROR_ALREADY_EXISTS,
                });
            }
            // if no cached response then safe to fetch from fandom
            const newCacheEntry = {
                content: "",
                status: fandomTypes_1.FandomStatus.PROCESSING,
            };
            __classPrivateFieldGet(this, _FandomRequestHandler_cache, "f").set(key, newCacheEntry);
            const workerPath = path_1.default.join(__dirname, "fandomRequestHandler.js");
            const worker = new worker_threads_1.Worker(workerPath, {
                workerData: {
                    FandomRequest: req.body,
                    Key: key,
                },
            });
            worker.on("message", (msg) => {
                console.log(msg);
            });
            return Promise.resolve(newCacheEntry);
        };
        __classPrivateFieldSet(this, _FandomRequestHandler_cache, cache, "f");
    }
}
_FandomRequestHandler_cache = new WeakMap();
exports.default = FandomRequestHandler;
