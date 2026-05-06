import express from 'express';
import bodyParser from 'body-parser';
import entriesRouter from './routes/entries';

const app = express();

app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.use('/api/entries', entriesRouter);

export default app;
