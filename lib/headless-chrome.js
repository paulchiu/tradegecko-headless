const puppeteer = require("puppeteer");
const tradeGecko = require("./trade-gecko");
const log = require("./logger");

/**
 * @typedef {Object} ListResourcesParams
 * @property {string} username
 * @property {string} password
 * @property {string} resource
 * @property {number} page
 * @property {number} limit
 * @property {string[]} fields
 * @property {string} verbosity
 */
/**
 * @param {ListResourcesParams} params
 */
exports.listResources = async function(params) {
  const {
    username,
    password,
    resource,
    page,
    limit,
    fields,
    verbosity
  } = params;
  const logger = log.makeLogger(verbosity);

  logger("Signing in ...", "v");
  const browser = await puppeteer.launch();
  const browserPage = await tradeGecko.signIn(browser, username, password);

  logger("Getting products ...", "v");
  const resourceParams = {
    resource,
    resultLimit: limit,
    fields,
    verbosity,
    logger
  };
  const requestOptions = tradeGecko.makeResourcePagingOptions(page, limit);
  const resources = await tradeGecko.getResources(
    browserPage,
    resourceParams,
    requestOptions
  );
  logger(JSON.stringify(resources), "");

  logger("Done", "v");
  await browser.close();
};

exports.publishVariantOnChannel = async function(params) {
  const { username, password, variantId, channelId, verbosity } = params;
  const logger = log.makeLogger(verbosity);

  logger("Signing in ...", "v");
  const browser = await puppeteer.launch();
  const browserPage = await tradeGecko.signIn(browser, username, password);

  const method = "POST";
  const endpoint = `variants/${variantId}/channels`;
  const payload = JSON.stringify({ channel: { channel_id: channelId } });
  logger(`Requesting: ${method} ${endpoint}`, "v");
  const response = await tradeGecko.fetch(browserPage, method, endpoint, payload);
  logger(`Response: ${response.status} ${response.statusText}`)

  logger("Done", "v");
  await browser.close();
};
