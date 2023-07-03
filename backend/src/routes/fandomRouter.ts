// imports
import express from "express";
import { FandomStatus } from "../types/fandomTypes";
import FandomRequestHandler from "../controllers/fandomRequestHandler";
import FandomCache from "../controllers/fandomCache";

// type imports
import type { Router, Response } from "express";
import type { FandomRequest, FandomResponse } from "../types/fandomTypes";

const fandomRouter: Router = express.Router();
const fandomCache: FandomCache = new FandomCache();
const fandomRequestHandler: FandomRequestHandler = new FandomRequestHandler(
  fandomCache
);

fandomRouter.use(express.json());

fandomRouter.post("/fandom/api", async (req: FandomRequest, res: Response) => {
  const response: FandomResponse = await fandomRequestHandler.handlePost(req);

  if (response.status === FandomStatus.ERROR_ALREADY_EXISTS) {
    res.status(409).json(response);
    return;
  }

  res.status(202).json(response);
});

fandomRouter.get("/fandom/api", async (req: FandomRequest, res: Response) => {
  const response: FandomResponse = await fandomRequestHandler.handleGet(req);

  if (response.status === FandomStatus.ERROR_NOT_FOUND) {
    res.status(404).json(response);
    return;
  }

  if (
    response.status === FandomStatus.ERROR_MALFORMED_REQUEST ||
    response.status === FandomStatus.ERROR_INVALID_WIKI ||
    response.status === FandomStatus.ERROR_INVALID_PAGE
  ) {
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

export { fandomRouter };
