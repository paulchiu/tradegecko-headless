#!/usr/bin/env node

const chrome = require('../lib/headless-chrome');

require('yargs')
  .env('TG')
  .usage(
    '$0 [command] [options]' +
      '\n' +
      '\nIt is recommended that username and password be set as environment variables of' +
      '\nTG_USERNAME and TG_PASSWORD, respectively.'
  )
  .option('username', {
    describe: 'Username/email to sign in with',
    demandOption: true,
  })
  .option('password', {
    describe: 'Password to sign in with',
    demandOption: true,
  })
  .option('verbosity', {
    alias: 'v',
    describe: 'Choose different levels of verbosity',
    choices: ['v', 'vv'],
  })
  .command(
    'tg:resource:list [resource]',
    'List a given resource',
    yargs => {
      yargs
        .positional('resource', {
          describe:
            'AJAX resource available in TradeGecko; should confirm existance by seeing XHR' +
            ' requests in normal session that match the request pattern' +
            ' https://go.tradegecko.com/ajax/%s' +
            ' \n\nExample of valid resources include: products, variants',
          type: 'string',
        })
        .option('limit', {
          describe: 'Max number of results to fetch',
          default: 10000,
          number: true,
        })
        .option('page', {
          describe: 'TradeGecko page to start getting results from',
          default: 1,
          number: true,
        })
        .option('fields', {
          describe:
            'Fields to return in listed resources as CSV for example: id,created_at',
        })
        .coerce('fields', f => f.split(',').map(s => s.trim()))
        .example(
          'tg:resource:list products --limit=1 -v=vv --fields=id,created_at',
          'List id and created at fields for one product'
        );
    },
    chrome.listResources
  )
  .command(
    'tg:variant:publish-on-channel [variantId] [channelId]',
    'Publish a given variant on a given channel',
    yargs => {
      yargs.positional('variantId', {
        describe: 'Id of the variant, find it by getting resource list for "variants"',
        type: 'string',
      })
      yargs.positional('channelId', {
        describe: 'Id of the channel, find it by getting resource list for "channels"',
        type: 'string',
      })
      .example(
        'tg:variant:publish-on-channel 123 321',
        'Publish variant with id 123 on channel 321'
      );
    },
    chrome.publishVariantOnChannel
  )
  .help().argv;
