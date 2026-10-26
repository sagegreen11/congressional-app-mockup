const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const result = spawnSync('npx', ['expo', 'export', '-p', 'web'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    GITHUB_PAGES: '1',
    EXPO_WEB_BASE_URL: '/congressional-app-mockup',
  },
});

process.exit(result.status === null ? 1 : result.status);
