const querystring = require('querystring');
const objects = require('./objects');
const SIGNIN_URI = 'https://go.tradegecko.com/account/sign_in';
const USERNAME_SELECTOR = '#user_email';
const PASSWORD_SELECTOR = '#user_password';
const SIGNIN_BUTTON_SELECTOR = '#login';
const RESOURCES_URI = 'https://go.tradegecko.com/ajax';
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
exports.makeResourcePagingOptions = function (resultPage = 1, resultLimit = MAX_RESULTS_PER_PAGE) {
    return {
        limit: resultLimit < MAX_RESULTS_PER_PAGE ? resultLimit : MAX_RESULTS_PER_PAGE,
        page: resultPage,
        'status[]': 'active',
        order: 'created_at asc',
    };
}

/**
 * @param {puppeteer.Page} browserPage 
 * @param {string} resource
 * @param {object} requestOptions
 * @param {number} resultLimit
 * @param {string[]} fields
 */
exports.getResources = async function (browserPage, resource, requestOptions = resourcePagingOptions, resultLimit, fields) {
    // Rewind page
    requestOptions.page -= 1;
    let resources = [];
    let response = { products: [] };

    do {
        // Go to next page
        requestOptions.page += 1;

        // Submit request
        const query = querystring.stringify(requestOptions);
        const uri = `${RESOURCES_URI}/${resource}?${query}`;
        await browserPage.goto(uri, { waitUntil: 'networkidle2' });
        const contentString = await browserPage.$eval('pre', p => p.innerHTML);
        response = JSON.parse(contentString);

        // Filter by fields if provided
        const resourceData = fields
            ? response[resource].map(objects.filteredAttributesTransformer(fields))
            : response[resource];

        // Append to resources
        resources = resources.concat(resourceData);
    } while (response[resource].length > 0 && resources.length < resultLimit);

    return resources;
}