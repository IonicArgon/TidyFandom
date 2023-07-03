"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// imports
const node_cache_1 = __importDefault(require("node-cache"));
class FandomCache {
    constructor() {
        this.get = (key) => {
            return FandomCache.cache.get(key);
        };
        this.set = (key, value) => {
            return FandomCache.cache.set(key, value, 60 * 60 * 24 * 7);
        };
        this.delete = (key) => {
            FandomCache.cache.del(key);
        };
        this.flush = () => {
            FandomCache.cache.flushAll();
        };
        FandomCache.cache = new node_cache_1.default();
    }
}
exports.default = FandomCache;
