#!/usr/bin/env node

const chrome = require("../lib/headless-chrome");

require("yargs")
  .env("TG")
  .usage(
    "$0 [command] [options]" +
      "\n" +
      "\nIt is recommended that username and password be set as environment variables of" +
      "\nTG_USERNAME and TG_PASSWORD, respectively."
  )
  .option("username", {
    describe: "Username/email to sign in with",
    demandOption: true
  })
  .option("password", {
    describe: "Password to sign in with",
    demandOption: true
  })
  .option("verbosity", {
    alias: "v",
    describe: "Choose different levels of verbosity",
    choices: ["v", "vv"]
  })
  .command(
    "tg:resource:list [resource]",
    "List a given resource",
    yargs => {
      yargs
        .positional("resource", {
          describe:
            "AJAX resource available in TradeGecko; should confirm existance by seeing XHR" +
            " requests in normal session that match the request pattern" +
            " https://go.tradegecko.com/ajax/%s" +
            " \n\nExample of valid resources include: products, variants",
          type: "string"
        })
        .option("limit", {
          describe: "Max number of results to fetch",
          default: 10000,
          number: true
        })
        .option("page", {
          describe: "TradeGecko page to start getting results from",
          default: 1,
          number: true
        })
        .option("fields", {
          describe:
            "Fields to return in listed resources as CSV for example: id,created_at"
        })
        .coerce("fields", f => f.split(",").map(s => s.trim()))
        .example(
          "tg:resource:list products --limit=1 -v=vv --fields=id,created_at",
          "List id and created at fields for one product"
        );
    },
    chrome.listResources
  )
  .command(
    "tg:ajax:fetch [method] [endpoint]",
    "Perform a fetch call against the TradeGecko AJAX API, see MDN entry for Fetch API" +
      " for details",
    yargs => {
      yargs
        .positional("method", {
          describe: 'Request method, such as "POST"',
          type: "string"
        })
        .positional("endpoint", {
          describe:
            'Resource endpoint, such a "products", please note that all endpoints' +
            " automatically have https://go.tradegecko.com/ajax/ prefixed",
          type: "string"
        })
        .option("body", {
          describe:
            "Body to be provided to the fetch call, if provided should be a JSON string",
          string: true
        })
        .example(
          "tg:ajax:fetch GET 'products?limit=1&page=1'",
          "Get the first product in the user's inventory"
        )
        .example(
          "tg:ajax:fetch POST 'variants/123/channels' --body='{\"channel\":{\"channel_id\":321}}'",
          "Publish variant 123 on channel 321"
        );
    },
    chrome.fetch
  )
  .command(
    "tg:resources-file:fetch [file] [method] [endpointTemplate] [bodyTemplate]",
    "Perform fetch action on a provided JSON file",
    yargs => {
      yargs
        .positional("file", {
          describe:
            "Resources file. This should be a JSON file like one created by tg:resource:list",
          type: "string"
        })
        .positional("method", {
          describe: 'Request method, such as "POST"',
          type: "string"
        })
        .positional("endpointTemplate", {
          describe:
            "Mustashe template string representing the endpoint. Template data will be a" +
            "record from the resources file provided.",
          type: "string"
        })
        .positional("bodyTemplate", {
          describe:
            "Mustashe template string representing the fetch body. Template data will be a" +
            "record from the resources file provided. If provided it should be a JSON string.",
          type: "string"
        })
        .option("offset", {
          describe: "Number of variants to skip",
          default: 0,
          number: true
        })
        .option("limit", {
          describe: "Max number of variants to publish",
          default: 10000,
          number: true
        });
    },
    chrome.fetchWithResourcesFile
  )
  .help().argv;
