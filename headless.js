const ppteer = require("puppeteer-extra");
// http://arh.antoinevastel.com/bots/areyouheadless
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
ppteer.use(StealthPlugin());
ppteer.launch({ headless: true }).then(async (browser) => {
    console.log("Running tests..");
    const page = await browser.newPage();
    // await page.goto("https://instagram.com/rocketseat_oficial");
    await page.goto("http://arh.antoinevastel.com/bots/areyouheadless");
    // await page.waitFor(5000);
    await page.screenshot({ path: "testresult.png", fullPage: true });
    await browser.close();
    console.log(`All done, check the screenshot. ✨`);
});
