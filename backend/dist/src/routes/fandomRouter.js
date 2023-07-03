"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fandomRouter = void 0;
// imports
const express_1 = __importDefault(require("express"));
const fandomTypes_1 = require("../types/fandomTypes");
const fandomRequestHandler_1 = __importDefault(require("../controllers/fandomRequestHandler"));
const fandomCache_1 = __importDefault(require("../controllers/fandomCache"));
const fandomRouter = express_1.default.Router();
exports.fandomRouter = fandomRouter;
const fandomCache = new fandomCache_1.default();
const fandomRequestHandler = new fandomRequestHandler_1.default(fandomCache);
fandomRouter.use(express_1.default.json());
fandomRouter.post("/fandom/api", async (req, res) => {
    const response = await fandomRequestHandler.handlePost(req);
    if (response.status === fandomTypes_1.FandomStatus.ERROR_ALREADY_EXISTS) {
        res.status(409).json(response);
        return;
    }
    res.status(202).json(response);
});
fandomRouter.get("/fandom/api", async (req, res) => {
    const response = await fandomRequestHandler.handleGet(req);
    if (response.status === fandomTypes_1.FandomStatus.ERROR_NOT_FOUND) {
        res.status(404).json(response);
        return;
    }
    if (response.status === fandomTypes_1.FandomStatus.ERROR_MALFORMED_REQUEST ||
        response.status === fandomTypes_1.FandomStatus.ERROR_INVALID_WIKI ||
        response.status === fandomTypes_1.FandomStatus.ERROR_INVALID_PAGE) {
        res.status(400).json(response);
        const { wiki, page } = req.body;
        const key = `${wiki}/${page}`;
        fandomCache.delete(key);
        return;
    }
    res.status(200).json(response);
});
// graceful shutdown
process.on("SIGTERM", () => {
    fandomCache.flush();
    process.exit(0);
});
process.on("SIGINT", () => {
    fandomCache.flush();
    process.exit(0);
});
