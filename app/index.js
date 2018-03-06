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
    }, (argv) => {
        chrome.listVariants(argv.username, argv.password);
    })
    .help()
    .argv