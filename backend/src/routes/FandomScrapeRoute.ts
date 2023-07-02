import express, { Router, Request, Response } from "express";
import { chromium, Browser } from "@playwright/test";
import FandomScrapeController from "../controllers/FandomScrapeController";

const fandomScrapeRouter: Router = express.Router();

// TODO: add a worker thread to handle the browser

// initialize browser and controller
let browser: Browser;
let fandomScrapeController: FandomScrapeController;
chromium.launch().then((b) => {
  browser = b;
  fandomScrapeController = new FandomScrapeController(browser);
});

fandomScrapeRouter.use(express.json());

fandomScrapeRouter.post(
  "/api/scrape",
  async (req: Request, res: Response) => {
    const { wiki, page } = req.body;
    const pageContent = await fandomScrapeController.test(req);
    res.send(pageContent);
  }
);

fandomScrapeRouter.get(
  "/api/scrape",
  async (req: Request, res: Response) => {

  }
);

// graceful shutdown
process.on("SIGTERM", async () => {
  await browser.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await browser.close();
  process.exit(0);
});

export default fandomScrapeRouter;
