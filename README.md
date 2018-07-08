# TradeGecko Headless CLI

Headless [TradeGecko](https://www.tradegecko.com/) interaction CLI for those without API access or for automating calls not yet published in the [TradeGecko API Reference](http://developer.tradegecko.com/).

# Install

```
npm install --global tradegecko-headless
```

If you receive the error [ERROR: Failed to download Chromium](https://github.com/GoogleChrome/puppeteer/issues/375),
please see the [NPM article on preventing premission errors](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

Given that a Chrome headless instance will need to be launched, it is advised that a local install
be used if permission issues exist.

# Usage

The following usage examples should be read sequentially as it references results from previous commands.

It is also recommended that all result files be viewed or manipulated with [jq](https://stedolan.github.io/jq/).

## Command pattern

To use the CLI, identify the command you want to execute and provide any parameters and options.

```
tgcli [command] [options]
```

To see the full list of commands, execute

```
tgcli --help
```

## Set username and password

Username and password can be provided as environment variables or as parameters. It is
recommended that environment variables be used.

```
export TG_USERNAME="foo@example.com"
export TG_PASSWORD="bar"
```

## Download a list of resources

Download 2nd and 3rd oldest `variants` resource, keeping only fields `id` and `created_at` and save them to file `variants.json`

```
tgcli tg:resource-list:download variants variants.json --limit=2 --offset=1 --fields=id,created_at
```

### Sample output

```
Signing in ...
Getting variants count ...
Getting variants ...
 ████████████████████████████████████████ 100% | ETA: 0s | 2/2
Saving variants to file ...
Done
```

### Sample output file contents

```
[{"id":1,"created_at":"2017-01-11T11:00:00.000Z"},{"id":2,"created_at":"2017-01-11T12:00:00.000Z"}]
```

## Perform fetch actions on a JSON object list

Make a fetch call using `variants.json` and output results to `fetched-variants.json`. The fetch
call should make a GET call to get the variant by id.

```
tgcli tg:resource-list:fetch variants.json fetched-variants.json GET "variants/{{id}}"
```

### Sample output

```
Signing in ...
Performing fetches ...
 ████████████████████████████████████████ 100% | ETA: 0s | 2/2
Saving responses to file ...
Done
```

### Sample output file contents

Plese note the following outputs have been shortended for readability.

```
[{"variant":{"id":1,"created_at":"2017-01-11T11:00:00.000Z","updated_at":"...","committed_stock_levels":{}}},{"variant":{"id":2,"created_at":"2017-01-11T12:00:00.000Z","updated_at":"...","committed_stock_levels":{}}}]
```

# Commands

For a full list of commands, execute the program with `--help`. All commands should be prefixed with `tgcli`.

|Command|Description|
|-------|-----------|
|`tg:resource-list:download [resource] [file]`|Download a list of a given resource|
|`tg:resource-list:fetch [listFile] [responsesFile] [method] [endpoint]`|Perform fetch action on each record of a provided resource list JSON file|
|`tg:resource:count [resource]`|Get the total records of a given resource|
|`tg:ajax:fetch [method] [endpoint]`|Perform a fetch call against the TradeGecko AJAX API, see the [MDN entry for Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for details|
# Known TradeGecko resources

The following list of resources were obtained by observing Chrome debugger XHR activity for connections related to `https://go.tradegecko.com/ajax`

- channels
- products
- variants

Although not fully tested, most resources listed in the [TradeGecko API Reference](http://developer.tradegecko.com/) should be available as well.

# Built with

- [Puppeteer](https://github.com/GoogleChrome/puppeteer) for headless Chrome interaction
- [yargs](https://github.com/yargs/yargs) for CLI
- [cli-progress](https://www.npmjs.com/package/cli-progress) for progress bars
- [mustache](https://www.npmjs.com/package/mustache) for parameter templates