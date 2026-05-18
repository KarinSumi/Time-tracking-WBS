import request from 'supertest';
import { generateToken } from '../src/middleware/auth';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyIsolation() {
  console.log('--- Phase 11: Multi-Tenant Isolation Audit (Supertest) ---');

  // 1. Stitch Alice (Org: org-001)
  const stitchAliceToken = generateToken('usr-stitch-alice', 'USER', 'org-001');
  // 2. Velocity Charlie (Org: org-002)
  const velCharlieToken = generateToken('usr-vel-charlie', 'USER', 'org-002');

  console.log('\n[TEST 1] Stitch Alice fetches projects...');
  const res1 = await request(app)
    .get('/api/projects')
    .set('Authorization', `Bearer ${stitchAliceToken}`);
  
  const projects1 = res1.body;
  console.log(`Found ${projects1.length} projects for Stitch Alice.`);
  const hasVelocity = projects1.some((p: any) => p.name.includes('Rocket'));
  if (hasVelocity) {
    console.log('❌ FAIL: Stitch Alice can see Velocity Labs projects!');
  } else {
    console.log('✅ PASS: Velocity Labs projects are hidden.');
  }

  console.log('\n[TEST 2] Velocity Charlie fetches projects...');
  const res2 = await request(app)
    .get('/api/projects')
    .set('Authorization', `Bearer ${velCharlieToken}`);
  
  const projects2 = res2.body;
  console.log(`Found ${projects2.length} projects for Velocity Charlie.`);
  const hasStitch = projects2.some((p: any) => p.name.includes('Stitch'));
  if (hasStitch) {
    console.log('❌ FAIL: Velocity Charlie can see Stitch & Co projects!');
  } else {
    console.log('✅ PASS: Stitch & Co projects are hidden.');
  }

  console.log('\n[TEST 3] Database-Level Cross-Check...');
  const stitchProjects = await prisma.project.findMany({ where: { orgId: 'org-001' } });
  const velocityProjects = await prisma.project.findMany({ where: { orgId: 'org-002' } });

  const overlap = stitchProjects.filter(p1 => velocityProjects.some(p2 => p1.id === p2.id));
  if (overlap.length === 0) {
    console.log('✅ PASS: Zero ID overlap between organizations.');
  } else {
    console.log('❌ FAIL: Found overlapping project IDs!');
  }
}

verifyIsolation().catch(console.error);
