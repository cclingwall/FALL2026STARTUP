const { defineConfig } = require('vite');

module.exports = defineConfig({
  server: {
    fs: {
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/keys/**', '**/service/dbConfig.json'],
    },
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
