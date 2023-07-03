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
var _FandomPageGet_browser;
Object.defineProperty(exports, "__esModule", { value: true });
const fandomTypes_1 = require("../types/fandomTypes");
const fandomCache_1 = __importDefault(require("../controllers/fandomCache"));
const test_1 = require("@playwright/test");
const worker_threads_1 = require("worker_threads");
class FandomPageGet {
    constructor(browser) {
        _FandomPageGet_browser.set(this, void 0);
        this.validateRequest = (req) => {
            if (!req.body.wiki || !req.body.page) {
                return false;
            }
            return true;
        };
        this.getPage = async (req) => {
            const { wiki, page } = req.body;
            const pageContext = await __classPrivateFieldGet(this, _FandomPageGet_browser, "f").newPage();
            let pageContent = "";
            await pageContext
                .goto(`https://${wiki}.fandom.com/wiki/${page}`)
                .then(async () => {
                const isWikiNotFound = await pageContext
                    .getByText("Not a valid community")
                    .isVisible();
                const isPageNotFound = await pageContext
                    .getByText("There is currently no text in this page.")
                    .isVisible();
                const isBadTitle = await pageContext
                    .getByText("Bad title")
                    .isVisible();
                if (isWikiNotFound) {
                    return Promise.resolve({
                        content: "Wiki not found.",
                        status: fandomTypes_1.FandomStatus.ERROR_INVALID_WIKI,
                    });
                }
                if (isPageNotFound) {
                    return Promise.resolve({
                        content: "Page not found.",
                        status: fandomTypes_1.FandomStatus.ERROR_INVALID_PAGE,
                    });
                }
                if (isBadTitle) {
                    return Promise.resolve({
                        content: "Bad title.",
                        status: fandomTypes_1.FandomStatus.ERROR_INVALID_PAGE,
                    });
                }
                // find the div in body called "mw-parser-output" and stringify it
                const pageContentElement = await pageContext.$("div#mw-parser-output");
                pageContent = await (pageContentElement === null || pageContentElement === void 0 ? void 0 : pageContentElement.innerHTML());
            })
                .catch((err) => {
                return Promise.resolve({
                    content: err,
                    status: fandomTypes_1.FandomStatus.ERROR_NOT_FOUND,
                });
            })
                .finally(async () => {
                await pageContext.close();
            });
            if (!pageContent) {
                return Promise.resolve({
                    content: "Page content not found.",
                    status: fandomTypes_1.FandomStatus.ERROR_NOT_FOUND,
                });
            }
            return Promise.resolve({
                content: pageContent,
                status: fandomTypes_1.FandomStatus.SUCCESS,
            });
        };
        this.handleGet = async (req) => {
            worker_threads_1.parentPort.postMessage("Handling GET request...");
            if (!this.validateRequest(req)) {
                return Promise.resolve({
                    content: "Invalid request.",
                    status: fandomTypes_1.FandomStatus.ERROR_MALFORMED_REQUEST,
                });
            }
            worker_threads_1.parentPort.postMessage("Request is valid.");
            return this.getPage(req);
        };
        __classPrivateFieldSet(this, _FandomPageGet_browser, browser, "f");
    }
}
_FandomPageGet_browser = new WeakMap();
(async () => {
    worker_threads_1.parentPort.postMessage("Worker data:", worker_threads_1.workerData);
    const browser = await test_1.chromium.launch({
        headless: false,
    });
    const pageGet = new FandomPageGet(browser);
    const cache = new fandomCache_1.default();
    const response = await pageGet.handleGet(worker_threads_1.workerData.FandomRequest);
    const key = worker_threads_1.workerData.Key;
    worker_threads_1.parentPort.postMessage(`Setting cache with key ${key}...`);
    cache.set(key, response);
    await browser.close();
    process.exit(0);
})();
