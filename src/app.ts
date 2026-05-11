import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import entriesRouter from './routes/entries';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import phasesRouter from './routes/phases';
import plansRouter from './routes/plans';
import adminRouter from './routes/admin';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(bodyParser.json());

app.get('/health', (req, res) => { res.sendStatus(200); });

app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/phases', phasesRouter);
app.use('/api/plans', plansRouter);
app.use('/api/admin', adminRouter);

export default app;
