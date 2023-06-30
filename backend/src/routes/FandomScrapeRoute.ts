import express, { Router, Request, Response } from 'express';
import FandomScrapeController from '../controllers/FandomScrapeController';

const fandomScrapeRouter: Router = express.Router();
const fandomScrapeController = new FandomScrapeController();

fandomScrapeRouter.use(express.json());

fandomScrapeRouter.get(
    '/api/scrape',
    async (req: Request, res: Response) => {
        const body = req.body;
        let url = null;
        
        if (body.url) {
            url = body.url;
        } else {
            res.status(400).send({ error: 'Bad Request' });
            return
        }

        let title = null;
        try {
            title = await fandomScrapeController.scrape(url);
        } catch (error) {
            res.status(500).send({ error: error });
            return
        }

        res.status(200).send({ title: title });
    }
);

export default fandomScrapeRouter;