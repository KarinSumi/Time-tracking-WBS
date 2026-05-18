import request from 'supertest';
import { generateToken } from '../src/middleware/auth';
import app from '../src/app'; // I need to ensure app is exported

async function runSecurityAudit() {
  console.log('--- Phase 10: Security Audit & IDOR Verification (Supertest) ---');

  // 1. Generate Tokens for two different users in same org
  const aliceToken = generateToken('7845327f-3c6f-41ab-b4b3-a16363fe4390', 'USER', 'org-001');
  const bobToken = generateToken('eb8044af-7eb1-4782-96c1-80ab9330d65c', 'USER', 'org-001');

  // Alice's entry ID from previous probe
  const aliceEntryId = '09256b4c-6fe7-4120-b805-f598bc32f5b6';

  console.log('\n[TEST 1] IDOR: Bob attempts to DELETE Alice\'s entry...');
  const res1 = await request(app)
    .delete(`/api/entries/${aliceEntryId}`)
    .set('Authorization', `Bearer ${bobToken}`);
  
  if (res1.status === 403) {
    console.log('✅ PASS: Bob was denied access (403 Forbidden).');
  } else {
    console.log(`❌ FAIL: Expected 403, got ${res1.status}`);
  }

  console.log('\n[TEST 2] IDOR: Bob attempts to UPDATE Alice\'s entry...');
  const res2 = await request(app)
    .put(`/api/entries/${aliceEntryId}`)
    .send({ hours: 99, taskDescription: 'Hacked!' })
    .set('Authorization', `Bearer ${bobToken}`);
  
  if (res2.status === 403) {
    console.log('✅ PASS: Bob was denied access (403 Forbidden).');
  } else {
    console.log(`❌ FAIL: Expected 403, got ${res2.status}`);
  }

  console.log('\n[TEST 3] Tenant Isolation: Alice fetches entries...');
  const res3 = await request(app)
    .get('/api/entries')
    .set('Authorization', `Bearer ${aliceToken}`);
  
  const entries = res3.body;
  const hasOthers = entries.some((e: any) => e.userId !== '7845327f-3c6f-41ab-b4b3-a16363fe4390');
  if (hasOthers) {
    console.log('❌ FAIL: Alice can see entries belonging to other users.');
  } else {
    console.log('✅ PASS: Alice only sees her own entries.');
  }
}

runSecurityAudit();
