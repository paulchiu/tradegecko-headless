#!/usr/bin/env node

const chrome = require('../lib/headless-chrome');

require('yargs')
    .command('tg:variants:list [username] [password]', 'List variants', (yargs) => {
        yargs
            .positional('username', {
                describe: 'Username/email to sign in with',
            })
            .positional('password', {
                describe: 'Password to sign in with',
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
    }, (argv) => {
        chrome.listVariants(argv.username, argv.password, argv.page, argv.limit);
    })
    .help()
    .argv