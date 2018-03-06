const querystring = require('querystring');
const SIGNIN_URI = 'https://go.tradegecko.com/account/sign_in';
const USERNAME_SELECTOR = '#user_email';
const PASSWORD_SELECTOR = '#user_password';
const SIGNIN_BUTTON_SELECTOR = '#login';
const PRODUCTS_URI = 'https://go.tradegecko.com/ajax/products';
const MAX_RESULTS_PER_PAGE = 250;

/**
 * @param {puppeteer.Browser} browser 
 * @param {string} username 
 * @param {string} password 
 * @returns {puppeteer.Page}
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

// Default resource paging options
exports.makeResourcePagingOptions = function (resultPage = 1, resultLimit = 250) {
    return {
        limit: resultLimit < MAX_RESULTS_PER_PAGE ? resultLimit : MAX_RESULTS_PER_PAGE,
        page: resultPage,
        'status[]': 'active',
        order: 'created_at asc',
    };
}

/**
 * @param {puppeteer.Page} browserPage 
 * @param {number} resultLimit
 * @param {object} options
 */
exports.getProducts = async function (browserPage, resultLimit, options = resourcePagingOptions) {
    // Rewind page
    options.page -= 1;
    let products = [];
    let contents = { products: [] };

    do {
        // Go to next page
        options.page += 1;

        // Submit request
        const query = querystring.stringify(options);
        const uri = `${PRODUCTS_URI}?${query}`;
        await browserPage.goto(uri, { waitUntil: 'networkidle2' });
        const contentString = await browserPage.$eval('pre', p => p.innerHTML);
        contents = JSON.parse(contentString);
        products = products.concat(contents.products);
    } while (contents.products.length > 0 && products.length <= resultLimit);

    return products;
}