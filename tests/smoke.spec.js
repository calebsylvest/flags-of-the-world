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

test('footer credits the author',async({page})=>{
  await page.goto('/');
  await expect(page.locator('footer .by a')).toHaveAttribute('href','https://www.calebsylvest.com');
  await expect(page.locator('footer .by')).toHaveText('Made by Caleb Sylvest');
});

test('quiz flag groups appear for a region, start selected, and narrow the quiz',async({page})=>{
  await page.goto('/#quiz');
  await page.click('[data-mode="name"]');
  await expect(page.locator('[data-qg]')).toHaveCount(0); // Whole world: no groups
  await page.click('[data-qr="Americas"]');
  const groups=page.locator('[data-qg]');
  await expect(groups).toHaveCount(6);
  await expect(page.locator('[data-qg][aria-pressed="true"]')).toHaveCount(6);
  await expect(page.locator('#qsov')).toBeVisible(); // all selected: same as the whole region
  // keep only North America (3) and Central America (7)
  for(const id of await groups.evaluateAll(bs=>bs.map(b=>b.dataset.qg)))
    if(!['north-america','central-america'].includes(id))await page.click(`[data-qg="${id}"]`);
  await expect(page.locator('[data-qg][aria-pressed="true"]')).toHaveCount(2);
  await expect(page.locator('[data-ql="all"]')).toHaveText('All 10');
  await expect(page.locator('#qsov')).toHaveCount(0); // groups are countries only
  await page.click('[data-ql="all"]');
  await page.click('#start');
  await expect(page.locator('.qprog')).toContainText('of 10');
  // switching region resets the groups to all selected
  await page.click('#quit');await page.click('#again');
  await page.click('[data-qr="Europe"]');
  await expect(page.locator('[data-qg][aria-pressed="false"]')).toHaveCount(0);
  // deselecting every group asks for one
  for(const b of await page.locator('[data-qg]').all())await b.click();
  await expect(page.locator('#start')).toHaveCount(0);
  await expect(page.locator('.qwrap')).toContainText('Pick at least one group.');
});

test('map quiz works with a group selection',async({page})=>{
  await page.goto('/#quiz');
  await page.click('[data-mode="map"]');
  await page.click('[data-qr="Oceania"]');
  await page.click('[data-qg]'); // drop the first Oceania group
  await page.click('#start');
  await expect(page.locator('#qmap svg')).toBeVisible();
});

test('country suggestions: ranking, keyboard, tap, alternate names',async({page})=>{
  await page.goto('/#daily');
  const input=page.locator('#din'),list=page.locator('.combo-list');
  await expect(input).toHaveAttribute('role','combobox');
  await expect(list).toBeHidden();
  await input.pressSequentially('na');
  await expect(list).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded','true');
  const first=await list.locator('[role=option]').first().textContent();
  expect(first.startsWith('Na'),`first suggestion for "na" was ${first}`).toBe(true); // names starting with the text come first
  await input.press('ArrowDown');
  await expect(list.locator('[aria-selected=true]')).toHaveCount(1);
  await input.press('Enter'); // picks, does not submit
  await expect(input).toHaveValue(first);
  await expect(list).toBeHidden();
  await expect(page.locator('.guess')).toHaveCount(0);
  // alternate names find the country and show the matched name
  await input.fill('');
  await input.pressSequentially('usa');
  const us=list.locator('[role=option]').filter({hasText:'United States'}).first();
  await expect(us).toBeVisible();
  await us.click();
  await expect(input).toHaveValue('United States');
  await expect(input).toBeFocused();
  // Escape closes
  await input.fill('');await input.pressSequentially('ger');
  await expect(list).toBeVisible();
  await input.press('Escape');
  await expect(list).toBeHidden();
  // an unknown name keeps the text and explains
  await input.fill('Narnia');await input.press('Escape');await input.press('Enter');
  await expect(page.locator('#dguess')).toContainText('No country matches');
  await expect(input).toHaveValue('Narnia');
});

test('map quiz suggestions pick a country to answer',async({page})=>{
  await page.goto('/#quiz');
  await page.click('[data-mode="map"]');
  await page.click('#start');
  await page.locator('#min').pressSequentially('jap');
  await page.locator('.combo-list [role=option]').first().click();
  await expect(page.locator('#min')).toHaveValue('Japan');
  await page.press('#min','Enter');
  await expect(page.locator('.feedback')).toBeVisible();
});
