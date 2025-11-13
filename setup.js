#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    log(`❌ Node.js version ${nodeVersion} detected. Please upgrade to Node.js 18 or higher.`, colors.red);
    process.exit(1);
  }

  log(`✅ Node.js version ${nodeVersion} - OK`, colors.green);
}

function checkPackageManager() {
  try {
    execSync('npm --version', { stdio: 'ignore' });
    log('✅ npm detected - OK', colors.green);
    return 'npm';
  } catch {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      log('✅ yarn detected - OK', colors.green);
      return 'yarn';
    } catch {
      log('❌ No package manager found. Please install npm or yarn.', colors.red);
      process.exit(1);
    }
  }
}

function createEnvFile() {
  const envExample = path.join(__dirname, '.env.example');
  const envLocal = path.join(__dirname, '.env.local');

  if (!fs.existsSync(envExample)) {
    log('❌ .env.example file not found', colors.red);
    return false;
  }

  if (fs.existsSync(envLocal)) {
    log('⚠️  .env.local already exists. Skipping creation.', colors.yellow);
    return true;
  }

  try {
    fs.copyFileSync(envExample, envLocal);
    log('✅ Created .env.local from .env.example', colors.green);
    return true;
  } catch (error) {
    log('❌ Failed to create .env.local file', colors.red);
    return false;
  }
}

function checkEnvVariables() {
  const envLocal = path.join(__dirname, '.env.local');

  if (!fs.existsSync(envLocal)) {
    log('❌ .env.local file not found', colors.red);
    return false;
  }

  const envContent = fs.readFileSync(envLocal, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=') && !envContent.includes('your_supabase_project_url_here');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=') && !envContent.includes('your_supabase_anon_key_here');

  if (!hasSupabaseUrl || !hasSupabaseKey) {
    log('⚠️  Supabase credentials not configured in .env.local', colors.yellow);
    return false;
  }

  log('✅ Environment variables configured', colors.green);
  return true;
}

function installDependencies(packageManager) {
  log('\n📦 Installing dependencies...', colors.blue);

  try {
    const command = packageManager === 'yarn' ? 'yarn install' : 'npm install';
    execSync(command, { stdio: 'inherit' });
    log('✅ Dependencies installed successfully', colors.green);
    return true;
  } catch (error) {
    log('❌ Failed to install dependencies', colors.red);
    return false;
  }
}

function displayNextSteps(envConfigured) {
  log('\n🎉 Setup completed!', colors.green + colors.bright);

  if (!envConfigured) {
    log('\n📝 Next steps:', colors.blue + colors.bright);
    log('1. Set up your Supabase project:', colors.cyan);
    log('   - Go to https://supabase.com and create a new project');
    log('   - Get your project URL and anon key from Settings > API');
    log('   - Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');

    log('\n2. Set up the database:', colors.cyan);
    log('   - Copy the SQL from supabase/migrations/20240101000001_initial_schema.sql');
    log('   - Paste it in Supabase Dashboard > SQL Editor and run it');

    log('\n3. Configure storage (optional):', colors.cyan);
    log('   - Go to Supabase Dashboard > Storage');
    log('   - Create a new bucket named "receipts"');
    log('   - Set appropriate access policies');

    log('\n4. Configure authentication (optional):', colors.cyan);
    log('   - Email/password auth works by default');
    log('   - For Google OAuth: Configure in Supabase Dashboard > Auth > Settings');
  } else {
    log('\n✨ You\'re all set!', colors.green);
  }

  log('\n🚀 Start the development server:', colors.blue + colors.bright);
  log('   npm run dev   (or yarn dev)', colors.cyan);
  log('\n📖 View the full documentation:', colors.blue);
  log('   Check out README.md for detailed instructions', colors.cyan);

  log('\n💡 Need help?', colors.magenta);
  log('   - Check the troubleshooting section in README.md');
  log('   - Open an issue on GitHub');
  log('   - Join our Discord community');
}

function main() {
  log('🔔 Subscription Manager Setup', colors.blue + colors.bright);
  log('================================\n', colors.blue);

  log('🔍 Checking prerequisites...', colors.yellow);

  // Check Node.js version
  checkNodeVersion();

  // Check package manager
  const packageManager = checkPackageManager();

  // Create .env.local file
  log('\n⚙️  Setting up environment...', colors.yellow);
  createEnvFile();

  // Check if environment is configured
  const envConfigured = checkEnvVariables();

  // Install dependencies
  const depsInstalled = installDependencies(packageManager);

  if (!depsInstalled) {
    log('\n❌ Setup failed. Please fix the errors above and try again.', colors.red);
    process.exit(1);
  }

  // Display next steps
  displayNextSteps(envConfigured);
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\n⚠️  Setup interrupted by user', colors.yellow);
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log('\n❌ Unexpected error occurred:', colors.red);
  console.error(error);
  process.exit(1);
});

// Run the setup
main();
