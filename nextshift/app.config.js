const appJson = require('./app.json');

// Mobile builds keep the app.json config. The GitHub Pages export sets
// GITHUB_PAGES=1 so assets load from /congressional-app-mockup/.
const expo = {
  ...appJson.expo,
  experiments: {
    ...appJson.expo.experiments,
  },
};

if (process.env.GITHUB_PAGES === '1' && process.env.EXPO_WEB_BASE_URL) {
  expo.experiments.baseUrl = process.env.EXPO_WEB_BASE_URL;
}

module.exports = { expo };
