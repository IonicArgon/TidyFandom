// import stuff here
import { FandomStatus } from "../types/fandomTypes";
import FandomCache from "../controllers/fandomCache";
import { Worker } from "worker_threads";
import path from "path";

// type imports
import type { FandomRequest, FandomResponse } from "../types/fandomTypes";

class FandomRequestHandler {
  #cache: FandomCache;

  constructor(cache: FandomCache) {
    this.#cache = cache;
  }

  public handleGet = async (req: FandomRequest): Promise<FandomResponse> => {
    const { wiki, page } = req.body;
    const key: string = `${wiki}/${page}`;
    const cachedResponse: FandomResponse | undefined = this.#cache.get(key);

    if (cachedResponse) {
      return Promise.resolve(cachedResponse);
    } else {
      return Promise.resolve({
        content: "Cached content not found. Please send a POST request.",
        status: FandomStatus.ERROR_NOT_FOUND,
      });
    }
  };

  public handlePost = async (req: FandomRequest): Promise<FandomResponse> => {
    const { wiki, page } = req.body;
    const key: string = `${wiki}/${page}`;
    const cachedResponse: FandomResponse | undefined = this.#cache.get(key);

    if (cachedResponse) {
      return Promise.resolve({
        content: "Cached content already exists. Please send a GET request.",
        status: FandomStatus.ERROR_ALREADY_EXISTS,
      });
    }

    // if no cached response then safe to fetch from fandom
    const newCacheEntry: FandomResponse = {
      content: "",
      status: FandomStatus.PROCESSING,
    };
    this.#cache.set(key, newCacheEntry);
    const workerPath: string = path.join(__dirname, "fandomRequestHandler.js");
    const worker: Worker = new Worker(workerPath, {
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
}

export default FandomRequestHandler;
