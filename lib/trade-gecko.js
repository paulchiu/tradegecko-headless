const querystring = require("querystring");
const objects = require("./objects");
const SIGNIN_URI = "https://go.tradegecko.com/account/sign_in";
const USERNAME_SELECTOR = "#user_email";
const PASSWORD_SELECTOR = "#user_password";
const SIGNIN_BUTTON_SELECTOR = "#login";
const RESOURCES_URI = "https://go.tradegecko.com/ajax";
const MAX_RESULTS_PER_PAGE = 250;

/**
 * @param {puppeteer.Browser} browser
 * @param {string} username
 * @param {string} password
 * @returns {puppeteer.Page}
 */
exports.signIn = async function(browser, username, password) {
  const page = await browser.newPage();
  await page.goto(SIGNIN_URI, { waitUntil: "networkidle2" });
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(username);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(password);
  await page.click(SIGNIN_BUTTON_SELECTOR);
  await page.waitForNavigation();
  return page;
};

// Default resource paging options
/**
 * @typedef {Object} ResourcePagingOptions
 * @property {number} limit
 * @property {number} page
 * @property {string[]]} status[]
 * @property {string} order
 */
/**
 * @todo Support making status an array, need to make sure it works with querystring.stringify
 * @param {number} resultPage
 * @param {number} resultLimit
 * @returns {ResourcePagingOptions}
 */
exports.makeResourcePagingOptions = function(
  resultPage = 1,
  resultLimit = MAX_RESULTS_PER_PAGE
) {
  return {
    limit:
      resultLimit < MAX_RESULTS_PER_PAGE ? resultLimit : MAX_RESULTS_PER_PAGE,
    page: resultPage,
    "status[]": "active",
    order: "created_at asc"
  };
};

/**
 * @typedef {function(string, string)} logger
 * @callback logger
 * @param {string} message
 * @param {string} messageVerbosity
 */
/**
 * @typedef {Object} GetResourceParams
 * @property {string} resource
 * @property {number} resultLimit
 * @property {string[]} fields
 * @property {logger} logger
 */
/**
 * @param {puppeteer.Page} browserPage
 * @param {GetResourceParams} params
 * @param {ResourcePagingOptions} requestOptions
 * @returns {Object[]}
 */
exports.getResources = async function(
  browserPage,
  params,
  requestOptions = resourcePagingOptions
) {
  let { resource, resultLimit, fields, logger } = params;
  let resourceLimit = resultLimit;
  let resources = [];
  let response = { products: [] };

  // Rewind page
  requestOptions.page -= 1;

  do {
    // Go to next page
    requestOptions.page += 1;

    // Submit request
    logger(`Fetching page ${requestOptions.page} ...`, "vv");
    const query = querystring.stringify(requestOptions);
    const uri = `${RESOURCES_URI}/${resource}?${query}`;
    await browserPage.goto(uri, { waitUntil: "networkidle2" });
    const contentString = await browserPage.$eval("pre", p => p.innerHTML);
    response = JSON.parse(contentString);

    // Filter by fields if provided
    const resourceData = fields
      ? response[resource].map(objects.filteredAttributesTransformer(fields))
      : response[resource];

    // Append to resources
    resources = resources.concat(resourceData);

    // Update result limit
    if (resultLimit > response.meta.total) {
      resultLimit = response.meta.total;
    }

    // Show progress
    const resultPercent = resources.length / resultLimit * 100;
    logger(
      `Processed ${
        resources.length
      } of ${resultLimit} results, ${resultPercent.toFixed(2)}% complete`,
      "vv"
    );
  } while (response[resource].length > 0 && resources.length < resultLimit);

  return resources;
};

/**
 * Fetch proxy for authorized requests to TradeGecko
 *
 * Endpoints are automaticalled prefixed with https://go.tradegecko.com/ajax/
 *
 * @param {puppeteer.Page} browserPage
 * @param {string} method
 * @param {string} endpoint
 * @param {string} payload
 * @returns {Object|string}
 */
exports.fetch = async function(browserPage, method, endpoint, body) {
  // Prepare request
  const uri = `${RESOURCES_URI}/${endpoint}`;

  // Validate body
  if (body) {
    try {
      JSON.parse(body);
    } catch (error) {
      throw `Please ensure provided body is valid JSON; ${error}`;
    }
  }

  // Submit request
  return await browserPage.evaluate(
    async (method, uri, body) => {
      const response = await fetch(uri, {
        method,
        body,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/javascript"
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        return `${response.status} ${response.statusText}`;
      }
    },
    method,
    uri,
    jsonBody
  );
};
