// Smoke tests: load the built site in a real browser and use each feature once.
// Every test fails if the page logs an error or throws.
const {test:base,expect}=require('@playwright/test');

const test=base.extend({
  page:async({page},use)=>{
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    // Keep tests independent of Google Fonts being reachable.
    await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,contentType:'text/css',body:''}));
    await use(page);
    expect(errors,'errors logged by the page').toEqual([]);
  },
});

const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('fotw-v1')||'null'));

test('browse lists every flag and search filters them',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(250);
  await page.fill('#q','japan');
  await expect(page.locator('.tile')).toHaveCount(1);
  await expect(page.locator('.tile .nm')).toHaveText('Japan');
});

test('flag page shows details and a map',async({page})=>{
  await page.goto('/#flag-fr');
  await expect(page.locator('h1')).toHaveText('France');
  await expect(page).toHaveTitle(/France/);
  await expect(page.locator('#locmap svg')).toBeVisible();
});

test('Antarctic territories link to a whole-world quiz',async({page})=>{
  await page.goto('/#flag-aq');
  await page.click('#quizregion');
  await expect(page.locator('[data-qr][aria-pressed="true"]')).toHaveText('Whole world');
  await expect(page.locator('#start')).toBeVisible();
});

for(const mode of ['name','find','look','fam']){
  test(`quiz mode "${mode}" answers a question`,async({page})=>{
    await page.goto('/#quiz');
    await page.click(`[data-mode="${mode}"]`);
    await page.click('#start');
    await page.locator('[data-pick]').first().click();
    await expect(page.locator('.feedback')).toBeVisible();
    await expect(page.locator('#next')).toBeVisible();
    await expect(page.locator('#live')).not.toBeEmpty();
  });
}

test('quiz mode "type" checks a typed answer',async({page})=>{
  await page.goto('/#quiz');
  await page.click('[data-mode="type"]');
  await page.click('#start');
  await page.fill('#tin','zzzz');
  await page.press('#tin','Enter');
  await expect(page.locator('.feedback.no')).toBeVisible();
});

test('quiz mode "map" loads the map and accepts a typed country',async({page})=>{
  await page.goto('/#quiz');
  await page.click('[data-mode="map"]');
  await page.click('#start');
  await expect(page.locator('#qmap svg')).toBeVisible();
  await page.fill('#min','France');
  await page.press('#min','Enter');
  await expect(page.locator('.feedback')).toBeVisible();
});

test('a full round saves progress that survives a reload, and reset clears it',async({page})=>{
  await page.goto('/#quiz');
  await page.click('[data-mode="name"]');
  await page.click('[data-qp="random"]');
  await page.click('#start');
  for(let i=0;i<10;i++){
    await page.keyboard.press('1');
    await page.click('#next');
  }
  await expect(page.locator('.score')).toHaveText(/\/10$/);
  expect(Object.keys((await saved(page)).best)).toContain('name|world');
  await page.reload(); // in-memory round is gone; the setup page reads saved progress
  await expect(page.locator('#start')).toBeVisible();
  const counts=await page.locator('.pstats dd').allTextContents();
  expect(+counts[0]+ +counts[1]).toBeGreaterThan(0); // mastered + learning
  await page.click('#reset');
  await page.click('#reset');
  await expect(page.locator('#datamsg')).toHaveText('Progress reset.');
  expect((await saved(page)).stats).toEqual({});
});

test('learn unit shows a map and practice records answers',async({page})=>{
  await page.goto('/#learn');
  await page.locator('.ucard').first().click();
  await expect(page.locator('#meetmap svg')).toBeVisible();
  await page.click('[data-step="practice"]');
  await page.locator('[data-lp]').first().click();
  await expect(page.locator('.feedback')).toBeVisible();
  expect(Object.keys((await saved(page)).stats).length).toBe(1);
});

test('daily flag takes a guess and saves it',async({page})=>{
  await page.goto('/#daily');
  await page.fill('#din','France');
  await page.press('#din','Enter');
  await expect(page.locator('.guess')).toHaveCount(1);
  const days=Object.values((await saved(page)).daily);
  expect(days[0].g).toEqual(['fr']);
});

test('install and offline files are served and filled in',async({page,request})=>{
  await page.goto('/');
  const manifestHref=await page.locator('link[rel=manifest]').getAttribute('href');
  const manifest=await (await request.get(manifestHref)).json();
  for(const icon of manifest.icons)expect((await request.get(icon.src)).ok(),icon.src).toBe(true);
  const sw=await (await request.get('sw.js')).text();
  expect(sw).not.toContain('__');
  const mapUrl=sw.match(/'(map\.json\?v=\w+)'/)[1];
  expect((await request.get(mapUrl)).ok()).toBe(true);
});
