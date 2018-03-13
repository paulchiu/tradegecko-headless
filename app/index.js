#!/usr/bin/env node

const commands = require("../lib/commands");

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
    "tg:resource-list:download [resource] [file]",
    "Download a list of a given resource",
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
        .positional("file", {
          describe: "File to sasve resources to; output will be in JSON",
          type: "string"
        })
        .option("offset", {
          describe: "Results to offset",
          default: 0,
          number: true
        })
        .option("limit", {
          describe: "Max number of results to fetch",
          default: 10000,
          number: true
        })
        .option("fields", {
          describe:
            "Fields to return in listed resources as CSV for example: id,created_at"
        })
        .coerce("fields", f => f.split(",").map(s => s.trim()))
        .example(
          "tg:resource-list:download products products.json --limit=1 -v=vv --fields=id,created_at",
          "Download id and created at fields for one product"
        );
    },
    commands.downloadResourceList
  )
  .command(
    "tg:resource-list:fetch [listFile] [responsesFile] [method] [endpoint]",
    "Perform fetch action on each record of a provided resource list JSON file",
    yargs => {
      yargs
        .positional("listFile", {
          describe:
            "Resources list file. This should be a JSON file like one created by tg:resource:list",
          type: "string"
        })
        .positional("responsesFile", {
          describe:
            "Fetch responses file. This will be another list file that may or may not be resources.",
          type: "string"
        })
        .positional("method", {
          describe: 'Request method, such as "POST"',
          type: "string"
        })
        .positional("endpoint", {
          describe:
            "Mustashe template string representing the endpoint. Template data will be a" +
            "record from the resources file provided.",
          type: "string"
        })
        .option("body", {
          describe:
            "Mustashe template string representing the fetch body. Template data will be a" +
            "record from the resources file provided. If provided it should be a JSON string.",
          string: true
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
        })
        .example(
          'tg:resource-list:fetch variants.json channels.json POST "variants/{{id}}/channels" --body=\'{"channel":{"channel_id":123}}\'',
          "Publish all variants in the provided file to channel 123"
        );
    },
    commands.fetchWithResourceList
  )
  .command(
    "tg:resource:count [resource]",
    "Get the total records of a given resource",
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
        .example(
          "tg:resource:count products",
          "Get the total number of products available"
        );
    },
    commands.countResources
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
    commands.fetch
  )
  .help().argv;
