const querystring = require('querystring');
const SIGNIN_URI = 'https://go.tradegecko.com/account/sign_in';
const USERNAME_SELECTOR = '#user_email';
const PASSWORD_SELECTOR = '#user_password';
const SIGNIN_BUTTON_SELECTOR = '#login';
const PRODUCTS_URI = 'https://go.tradegecko.com/ajax/products';

/**
 * @param {puppeteer.Browser} browser 
 * @param {string} username 
 * @param {string} password 
 */
exports.signIn = async function (browser, username, password) {
    const page = await browser.newPage();
    await page.goto(SIGNIN_URI, { waitUntil: 'networkidle2' });
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(username);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(password);
    await page.click(SIGNIN_BUTTON_SELECTOR);
    await page.waitForNavigation();
    return page;
};

/**
 * @param {puppeteer.Page} page 
 */
getProductsOptions = {
    limit: 1,
    page: 1,
    'status[]': 'active',
    order: 'created_at asc',
};
exports.getProducts = async function (page, options = getProductsOptions) {
    const query = querystring.stringify(options);
    const uri = `${PRODUCTS_URI}?${query}`;
    await page.goto(uri, { waitUntil: 'networkidle2' });
    const contents = JSON.parse(await page.$eval('pre', p => p.innerHTML));
    console.log(contents);
}