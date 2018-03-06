const puppeteer = require('puppeteer');
const tradeGecko = require('./trade-gecko');

/**
 * @param {string} username 
 * @param {string} password 
 * @param {number} resultPage 
 * @param {number} limit 
 */
exports.listVariants = async function (username, password, resultPage, limit) {
    // console.log('Signing in ...');
    const browser = await puppeteer.launch();
    const browserPage = await tradeGecko.signIn(browser, username, password);

    // console.log('Getting products ...');
    const options = tradeGecko.makeResourcePagingOptions(resultPage, limit);
    const products = await tradeGecko.getProducts(browserPage, limit, options);
    console.log(JSON.stringify(products));

    // console.log('Done');
    await browser.close();
};