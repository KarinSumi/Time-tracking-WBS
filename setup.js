/**
 * Aion Enterprise Time Logger
 * Automated Cross-Platform Setup Utility
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function logStep(msg) {
  console.log(`\n${colors.bright}${colors.cyan}⚙️  ${msg}...${colors.reset}`);
}

function logSuccess(msg) {
  console.log(`${colors.bright}${colors.green}✅ ${msg}${colors.reset}`);
}

function logError(msg, err) {
  console.error(`\n${colors.bright}${colors.red}❌ ${msg}${colors.reset}`);
  if (err) {
    console.error(err.message || err);
  }
  process.exit(1);
}

console.log(`
${colors.bright}${colors.blue}====================================================
           AION ENTERPRISE TIME LOGGER
         Cross-Platform Installation Setup
====================================================${colors.reset}
`);

try {
  // Step 1: Install root dependencies
  logStep('Installing backend & toolchain dependencies (Root)');
  execSync('npm install', { stdio: 'inherit' });
  logSuccess('Root dependencies installed.');

  // Step 2: Install frontend dependencies
  logStep('Installing frontend dependencies (Vite + React)');
  execSync('npm install --prefix frontend', { stdio: 'inherit' });
  logSuccess('Frontend dependencies installed.');

  // Step 3: Set up Sample Database
  logStep('Provisioning SQLite Demo Database');
  const sourceDb = path.join(__dirname, 'prisma', 'sample.db');
  const targetDb = path.join(__dirname, 'prisma', 'dev.db');

  if (fs.existsSync(sourceDb)) {
    fs.copyFileSync(sourceDb, targetDb);
    logSuccess('Sample database copied successfully to prisma/dev.db');
  } else {
    logError('prisma/sample.db could not be found! Please verify repository assets.');
  }

  // Step 4: Verify Compilation & Build
  logStep('Compiling application (Vite build + TypeScript)');
  execSync('npm run build', { stdio: 'inherit' });
  logSuccess('Build compiled successfully.');

  console.log(`
${colors.bright}${colors.green}====================================================
 🎉 SETUP COMPLETED SUCCESSFULLY!
====================================================${colors.reset}

To run the application:
  ${colors.bright}${colors.yellow}npm run dev${colors.reset}

Default Credentials:
  - Super Admin: ${colors.cyan}superadmin@example.com${colors.reset} / ${colors.cyan}password123${colors.reset}
  - Stitch & Co Admin: ${colors.cyan}admin@stitch.com${colors.reset} / ${colors.cyan}password123${colors.reset}
  - Stitch & Co Member: ${colors.cyan}alice@stitch.com${colors.reset} / ${colors.cyan}password123${colors.reset}

Visit the bilingual manual at:
  ${colors.bright}${colors.blue}http://localhost:5173/tutorial/manual.html${colors.reset}
`);

} catch (error) {
  logError('Setup failed during execution. Please review the output above.', error);
}
