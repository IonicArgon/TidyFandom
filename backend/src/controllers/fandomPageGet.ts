import { FandomStatus } from "../types/fandomTypes";
import FandomCache from "../controllers/fandomCache";
import { chromium } from "@playwright/test";
import { parentPort, workerData } from "worker_threads";

// type imports
import type { FandomRequest, FandomResponse } from "../types/fandomTypes";
import type { Browser, Page } from "@playwright/test";

class FandomPageGet {
  #browser: Browser;

  constructor(browser: Browser) {
    this.#browser = browser;
  }

  private validateRequest = (req: FandomRequest): boolean => {
    if (!req.body.wiki || !req.body.page) {
      return false;
    }

    return true;
  };

  private getPage = async (req: FandomRequest): Promise<FandomResponse> => {
    const { wiki, page } = req.body;
    const pageContext: Page = await this.#browser.newPage();
    let pageContent: string | undefined = "";

    await pageContext
      .goto(`https://${wiki}.fandom.com/wiki/${page}`)
      .then(async () => {
        const isWikiNotFound: boolean = await pageContext
          .getByText("Not a valid community")
          .isVisible();
        const isPageNotFound: boolean = await pageContext
          .getByText("There is currently no text in this page.")
          .isVisible();
        const isBadTitle: boolean = await pageContext
          .getByText("Bad title")
          .isVisible();

        if (isWikiNotFound) {
          return Promise.resolve({
            content: "Wiki not found.",
            status: FandomStatus.ERROR_INVALID_WIKI,
          });
        }

        if (isPageNotFound) {
          return Promise.resolve({
            content: "Page not found.",
            status: FandomStatus.ERROR_INVALID_PAGE,
          });
        }

        if (isBadTitle) {
          return Promise.resolve({
            content: "Bad title.",
            status: FandomStatus.ERROR_INVALID_PAGE,
          });
        }

        // find the div in body called "mw-parser-output" and stringify it
        const pageContentElement = await pageContext.$("div#mw-parser-output");
        pageContent = await pageContentElement?.innerHTML();
      })
      .catch((err) => {
        return Promise.resolve({
          content: err,
          status: FandomStatus.ERROR_NOT_FOUND,
        });
      })
      .finally(async () => {
        await pageContext.close();
      });

    if (!pageContent) {
      return Promise.resolve({
        content: "Page content not found.",
        status: FandomStatus.ERROR_NOT_FOUND,
      });
    }

    return Promise.resolve({
      content: pageContent,
      status: FandomStatus.SUCCESS,
    });
  };

  public handleGet = async (req: FandomRequest): Promise<FandomResponse> => {
    parentPort.postMessage("Handling GET request...");
    if (!this.validateRequest(req)) {
      return Promise.resolve({
        content: "Invalid request.",
        status: FandomStatus.ERROR_MALFORMED_REQUEST,
      });
    }

    parentPort.postMessage("Request is valid.");
    return this.getPage(req);
  };
}

(async () => {
  parentPort.postMessage("Worker data:", workerData);
  const browser: Browser = await chromium.launch({
    headless: false,
  });
  const pageGet: FandomPageGet = new FandomPageGet(browser);
  const cache: FandomCache = new FandomCache();
  const response: FandomResponse = await pageGet.handleGet(
    workerData.FandomRequest
  );
  const key: string = workerData.Key;

  parentPort.postMessage(`Setting cache with key ${key}...`);
  cache.set(key, response);
  await browser.close();
  process.exit(0);
})();
