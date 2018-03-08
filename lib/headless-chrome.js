const fs = require('fs');
const mustache = require('mustache');
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

/**
 * @typedef {Object} FetchParams
 * @property {string} username
 * @property {string} password
 * @property {string} method
 * @property {string} endpoint
 * @property {string} body
 * @property {string} verbosity
 */
/**
 * @param {FetchParams} params
 */
exports.fetch = async function(params) {
  const { username, password, method, endpoint, body, verbosity } = params;
  const logger = log.makeLogger(verbosity);

  logger("Signing in ...", "v");
  const browser = await puppeteer.launch();
  const browserPage = await tradeGecko.signIn(browser, username, password);

  logger(`Requesting: ${method} ${endpoint}`, "v");
  const response = await tradeGecko.fetch(browserPage, method, endpoint, body);
  if (typeof response === 'object') {
    logger(JSON.stringify(response));
  } else {
    logger(`Response: ${response}`);
  }

  logger("Done", "v");
  await browser.close();
};

exports.fetchWithResourcesFile = async function(params) {
  const { username, password, file, method, endpointTemplate, bodyTemplate, offset, limit, verbosity } = params;
  const logger = log.makeLogger(verbosity);

  const data = JSON.parse(fs.readFileSync(file));
  let index = offset < data.length ? offset : data.length;
  const stopPoint = index + limit <= data.length ? index + limit : data.length;

  for (index; index < stopPoint; index++) {
    const endpoint = mustache.render(endpointTemplate, data[index]);
    const body = mustache.render(bodyTemplate, data[index]);
    logger(endpoint);
    logger(body);
  }

  /*
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
  */
};