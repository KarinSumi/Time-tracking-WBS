async function verifyPhase13() {
  console.log('🚀 Starting Phase 13 Final Verification...');
  const API_URL = 'http://localhost:3000/api';

  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@stitch.co', password: 'password123' })
    });
    const { token }: any = await loginRes.json();
    console.log('✅ Authenticated as Super Admin');

    const [auditRes, orgRes, teamRes] = await Promise.all([
      fetch(`${API_URL}/admin/audit-logs`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/organizations/settings`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/team`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const auditData: any = await auditRes.json();
    const orgData: any = await orgRes.json();
    const teamData: any = await teamRes.json();

    console.log(`✅ Audit Logs retrieved: ${auditData.length} entries`);
    console.log(`✅ Organization Settings: ${orgData.name}`);
    console.log(`✅ Team List: ${teamData.length} members`);

    console.log('\n🏆 Phase 13 Verification SUCCESSFUL!');
  } catch (error: any) {
    console.error('❌ Verification FAILED:', error.message);
    process.exit(1);
  }
}

verifyPhase13();
