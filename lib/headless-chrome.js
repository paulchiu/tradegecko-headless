const puppeteer = require('puppeteer');
const tradeGecko = require('./trade-gecko');

/**
 * @param {string} username 
 * @param {string} password 
 */
exports.listVariants = async function (username, password) {
    console.log('Signing in ...');
    const browser = await puppeteer.launch();
    const page = await tradeGecko.signIn(browser, username, password);

    console.log('Outputting screenshot ...');
    await page.pdf({ path: 'page.pdf', format: 'A4' });
    await browser.close();

    console.log('Done');
};