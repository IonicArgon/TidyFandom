import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import FandomScrapeRouter from './routes/FandomScrapeRoute';

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(FandomScrapeRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});