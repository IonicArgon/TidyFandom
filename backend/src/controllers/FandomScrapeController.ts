import { chromium } from "@playwright/test";

class FandomScrapeController {
    public scrape = async (url: string) : Promise<string> => {
        const browser = await chromium.launch({
            headless: false
        });
        const page = await browser.newPage();
        let title: string | null = null;
        
        await page.goto(url)
        .then(async () => {
            title = await page.title();
            await browser.close();
        })
        .catch(async () => {
            await browser.close();
        });

        if (title) {
            return Promise.resolve(title);
        } else {
            return Promise.reject('Internal Server Error');
        }
    }
};

export default FandomScrapeController;