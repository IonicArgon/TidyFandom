// imports
import NodeCache from "node-cache";

// type imports
import { FandomResponse } from "../types/fandomTypes";

class FandomCache {
  private static cache: NodeCache;

  constructor() {
    FandomCache.cache = new NodeCache();
  }

  public get = (key: string): FandomResponse | undefined => {
    return FandomCache.cache.get(key);
  };

  public set = (key: string, value: FandomResponse): boolean => {
    return FandomCache.cache.set(key, value, 60 * 60 * 24 * 7);
  };

  public delete = (key: string): void => {
    FandomCache.cache.del(key);
  };

  public flush = (): void => {
    FandomCache.cache.flushAll();
  };
}

export default FandomCache;
