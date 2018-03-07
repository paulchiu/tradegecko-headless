const puppeteer = require('puppeteer');
const tradeGecko = require('./trade-gecko');

/**
 * @typedef {Object} ListResourcesParams
 * @property {string} username 
 * @property {string} password 
 * @property {string} resource 
 * @property {number} page 
 * @property {number} limit 
 * @property {string[]} fields 
 */
/**
 * @param {ListResourcesParams} params
 */
exports.listResources = async function (params) {
    const {username, password, resource, page, limit, fields, verbosity} = params;

    output('Signing in ...', 'v', verbosity);
    const browser = await puppeteer.launch();
    const browserPage = await tradeGecko.signIn(browser, username, password);

    output('Getting products ...', 'v', verbosity);
    const resourceParams = {
        resource,
        resultLimit: limit,
        fields,
        verbosity,
        logger: (m, v) => output(m, v, verbosity),
    };
    const requestOptions = tradeGecko.makeResourcePagingOptions(page, limit);
    const resources = await tradeGecko.getResources(browserPage, resourceParams, requestOptions);
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