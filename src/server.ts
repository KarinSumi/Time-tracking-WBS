import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Enterprise Time Logger Backend running on http://localhost:${PORT}`);
  console.log(`✅ Health check available at http://localhost:${PORT}/health`);
});
