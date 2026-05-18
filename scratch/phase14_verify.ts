async function verifyPhase14() {
  const API_URL = 'http://localhost:3000/api';
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@stitch.co', password: 'password123' })
  });
  const { token }: any = await loginRes.json();
  
  const draftRes = await fetch(`${API_URL}/entries/summary/drafts`, { headers: { Authorization: `Bearer ${token}` } });
  const draftData = await draftRes.json();
  console.log('Draft Data:', JSON.stringify(draftData));

  const forecastRes = await fetch(`${API_URL}/reports/forecasting`, { headers: { Authorization: `Bearer ${token}` } });
  const forecastData = await forecastRes.json();
  console.log('Forecast Data:', JSON.stringify(forecastData));
}
verifyPhase14();
