import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

export default app;
