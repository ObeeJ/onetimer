const { spawn } = require('child_process');

console.log('🚀 Starting OneTime Survey Platform...\n');

// Start main app (Filler + Creator) on port 3000
const mainApp = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

console.log('📱 Main App (Filler + Creator): http://localhost:3000');
console.log('🔴 Admin Panel: http://localhost:3001 (manual start)');
console.log('🟣 Super Admin Panel: http://localhost:3002 (manual start)\n');

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  mainApp.kill();
  process.exit();
});