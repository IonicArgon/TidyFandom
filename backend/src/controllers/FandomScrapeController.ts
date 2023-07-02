import type { Browser } from "@playwright/test";
import type { Request } from "express";

interface FandomScrapeRequest extends Request {
  body: {
    wiki: string;
    page: string;
  };
}

class FandomScrapeController {
  #browser: Browser;

  constructor(browser: Browser) {
    this.#browser = browser;
  }

  private validateRequest = (req: FandomScrapeRequest): boolean => {
    if (req.body.wiki && req.body.page) {
      return true;
    }
    return false;
  };

  private getPageContent = async (
    wiki: string,
    page: string
  ): Promise<string> => {
    const browserContext = await this.#browser.newContext();
    const pageContext = await browserContext.newPage();
    let pageContent: string = "";

    await pageContext
      .goto(`https://${wiki}.fandom.com/wiki/${page}`)
      .then(async () => {
        const pageNonexistent = await pageContext
          .getByText("There is currently no text in this page.")
          .isVisible();
        if (!pageNonexistent) {
          pageContent = await pageContext.content();
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(async () => {
        await browserContext.close();
      });

    if (pageContent) {
      return Promise.resolve(pageContent);
    } else {
      return Promise.reject("URL is malformed.");
    }
  };

  public test = async (req: FandomScrapeRequest): Promise<string> => {
    if (this.validateRequest(req)) {
      const { wiki, page } = req.body;
      const pageContent = await this.getPageContent(wiki, page);
      return Promise.resolve(pageContent);
    }
    return Promise.reject("Request is malformed.");
  };
}

export default FandomScrapeController;
