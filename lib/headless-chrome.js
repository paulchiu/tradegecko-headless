const puppeteer = require('puppeteer');
const tradeGecko = require('./trade-gecko');

/**
 * @param {Object} options
 * @param {string} options.username 
 * @param {string} options.password 
 * @param {string} options.resource 
 * @param {number} options.page 
 * @param {number} options.limit 
 * @param {string[]} options.fields 
 */
exports.listResources = async function ({username, password, resource, page, limit, fields, verbosity} = {}) {
    output('Signing in ...', 'v', verbosity);
    const browser = await puppeteer.launch();
    const browserPage = await tradeGecko.signIn(browser, username, password);

    output('Getting products ...', 'v', verbosity);
    const requestOptions = tradeGecko.makeResourcePagingOptions(page, limit);
    const resources = await tradeGecko.getResources(browserPage, resource, requestOptions, limit, fields);
    output(JSON.stringify(resources), '', verbosity);

    output('Done', 'v', verbosity);
    await browser.close();
};

/**
 * @param {string} message 
 * @param {string} messageVerbosity 
 * @param {string} requestedVerbosity 
 */
function output(message, messageVerbosity, requestedVerbosity = '') {
    if (messageVerbosity.length <= requestedVerbosity.length) {
        console.log(message);
    }
}