// Smoke tests run against the built site: npm run build && npm test
const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'tests',
  timeout:30000,
  retries:process.env.CI?1:0,
  reporter:process.env.CI?[['github'],['list']]:'list',
  use:{baseURL:'http://localhost:4173/',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome']}},
    {name:'mobile',use:{...devices['Pixel 7']}},
  ],
  webServer:{command:'node tests/server.js 4173',url:'http://localhost:4173/',reuseExistingServer:!process.env.CI},
});
