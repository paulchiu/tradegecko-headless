const fs = require("fs");
const mustache = require("mustache");
const progress = require("cli-progress");
const puppeteer = require("puppeteer");
const querystring = require("querystring");

const log = require("./logger");
const objects = require("./objects");
const tradeGecko = require("./tradegecko");

/**
 * @typedef {Object} ListResourcesParams
 * @property {string} username
 * @property {string} password
 * @property {string} resource
 * @property {string} file
 * @property {number} offset
 * @property {number} limit
 * @property {string[]} fields
 * @property {string} verbosity
 */
/**
 * @param {ListResourcesParams} params
 */
exports.downloadResourceList = async function(params) {
  const {
    username,
    password,
    resource,
    file,
    offset,
    limit,
    fields,
    verbosity
  } = params;
  const logger = log.makeLogger(verbosity);

  logger("Signing in ...");
  const browser = await puppeteer.launch();
  const browserPage = await tradeGecko.signIn(browser, username, password);

  logger(`Getting ${resource} count ...`);
  const resourceCount = await tradeGecko.resourceCount(browserPage, resource);
  const actualLimit = limit > resourceCount ? resourceCount : limit;

  logger(`Getting ${resource} ...`);
  const bar = new progress.Bar({}, progress.Presets.shades_classic);
  const resultsIncrementedCallback = incrementAmount =>
    bar.increment(incrementAmount);
  const getPagedResourcesParams = {
    resource,
    resourceCount,
    offset,
    limit: actualLimit,
    fields,
    resultsIncrementedCallback
  };
  bar.start(actualLimit, 0);
  const resources = await tradeGecko.getPagedResources(
    browserPage,
    getPagedResourcesParams
  );
  bar.stop();

  logger(`Saving ${resource} to file ...`);
  fs.writeFileSync(file, JSON.stringify(resources));

  logger("Done");
  await browser.close();
};

/**
 * @typedef {Object} FetchWithResourcesFileParams
 * @property {string} username
 * @property {string} password
 * @property {string} method
 * @property {string} endpoint
 * @property {string} body
 * @property {number} offset
 * @property {number} limit
 * @property {string} verbosity
 */
/**
 * @param {FetchWithResourcesFileParams} params
 */
exports.fetchWithResourceList = async function(params) {
  const {
    username,
    password,
    file,
    method,
    endpoint,
    body,
    offset,
    limit,
    verbosity
  } = params;
  const logger = log.makeLogger(verbosity);
  const responseLogger = log.makeResponseLogger(verbosity);

  const data = JSON.parse(fs.readFileSync(file));
  let index = offset < data.length ? offset : data.length;
  const stopPoint = index + limit <= data.length ? index + limit : data.length;

  logger("Signing in ...", "v");
  const browser = await puppeteer.launch();
  const browserPage = await tradeGecko.signIn(browser, username, password);

  for (index; index < stopPoint; index++) {
    const requestEndpoint = mustache.render(endpoint, data[index]);
    const requestBody = body ? mustache.render(body, data[index]) : null;

    logger(`Requesting: ${method} ${requestEndpoint}`, "v");
    try {
      const response = await tradeGecko.fetch(
        browserPage,
        method,
        requestEndpoint,
        requestBody
      );
      responseLogger(response);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }

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
  const responseLogger = log.makeResponseLogger(verbosity);

  logger("Signing in ...", "v");
  const browser = await puppeteer.launch();
  const browserPage = await tradeGecko.signIn(browser, username, password);

  logger(`Requesting: ${method} ${endpoint}`, "v");
  const response = await tradeGecko.fetch(browserPage, method, endpoint, body);
  responseLogger(response);

  logger("Done", "v");
  await browser.close();
};
