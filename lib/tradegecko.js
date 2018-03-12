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
 * @param {number} page,
 * @param {number} limit
 * @param {string[]} status
 * @param {string} string
 * @returns {ResourcePagingOptions}
 */
exports.makeResourcePagingOptions = function(
  page = 1,
  limit = MAX_RESULTS_PER_PAGE,
  status = ["active"],
  order = "created_at asc"
) {
  limit = limit < MAX_RESULTS_PER_PAGE ? limit : MAX_RESULTS_PER_PAGE;

  return {
    limit,
    page,
    "status[]": status.join(","),
    order
  };
};

/**
 * @param {puppeteer.Page} browserPage
 * @param {string} resource
 * @returns {number}
 */
exports.resourceCount = async function(browserPage, resource) {
  const requestOptions = exports.makeResourcePagingOptions(1, 1);
  const query = querystring.stringify(requestOptions);
  const endpoint = `${resource}?${query}`;
  const result = await exports.fetch(browserPage, "GET", endpoint);
  return result.meta.total;
};

/**
 * @typedef {function(number)} resultsIncrementedCallback
 * @callback resultsIncrementedCallback
 * @param {number} incrementAmount
 */
/**
 * @typedef {Object} GetPagedReousrcesParams
 * @property {puppeteer.Page} browserPage
 * @property {number} resourceCount
 * @property {number} offset
 * @property {number} limit
 * @property {string[]} fields
 * @property {resultsIncrementedCallback} resultsIncrementedCallback
 */
/**
 * @todo Replace with async iterator or generators when available
 * @param {puppeteer.Page} browserPage
 * @param {GetPagedReousrcesParams} params
 */
exports.getPagedResources = async function(browserPage, params) {
  // Destruct params
  const {
    resource,
    resourceCount,
    offset,
    limit,
    fields,
    resultsIncrementedCallback
  } = params;

  // Calculate pages
  const startPage = Math.floor(offset / MAX_RESULTS_PER_PAGE) + 1;
  const pageOffset = offset % MAX_RESULTS_PER_PAGE;
  let page = startPage - 1;

  // Collect resources
  let resources = [];
  let responseResources = [];
  do {
    // Go to next page
    page++;

    // Prepare and submit request
    const requestOptions = exports.makeResourcePagingOptions(page, limit);
    const query = querystring.stringify(requestOptions);
    const endpoint = `${resource}?${query}`;
    const response = await exports.fetch(browserPage, "GET", endpoint);

    // Filter by fields if provided
    responseResources = fields
      ? response[resource].map(objects.filteredAttributesTransformer(fields))
      : response[resource];

    // Apply offset
    if (page == startPage) {
      responseResources = responseResources.slice(pageOffset);
    }

    // Apply limit
    if (resources.length + responseResources.length > limit) {
      const responsesNeeded = limit - resources.length;
      responseResources = responseResources.slice(0, responsesNeeded);
    }

    // Append to resources
    resources = resources.concat(responseResources);

    // Call results incremented callback
    if (resultsIncrementedCallback) {
      resultsIncrementedCallback(responseResources.length);
    }

    // Update progress
  } while (responseResources.length > 0 && resources.length < limit);

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
    body
  );
};
