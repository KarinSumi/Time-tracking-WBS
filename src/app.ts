import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import entriesRouter from './routes/entries';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import phasesRouter from './routes/phases';
import plansRouter from './routes/plans';
import adminRouter from './routes/admin';
import wbsRouter from './routes/wbs';
import reportsRouter from './routes/reports';
import holidaysRouter from './routes/holidays';
import teamRouter from './routes/team';
import organizationRouter from './routes/organizations';
import smartInsightsRouter from './routes/smartInsights';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => { res.sendStatus(200); });

app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/phases', phasesRouter);
app.use('/api/plans', plansRouter);
app.use('/api/admin', adminRouter);
app.use('/api/wbs-gantt', wbsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/holidays', holidaysRouter);
app.use('/api/team', teamRouter);
app.use('/api/organizations', organizationRouter);
app.use('/api/suggestions', smartInsightsRouter);

app.use(errorHandler);

export default app;
