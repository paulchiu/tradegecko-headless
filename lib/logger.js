/**
 * @param {string} message 
 * @param {string} messageVerbosity 
 * @param {string} requestedVerbosity 
 */
exports.output = function (message, messageVerbosity, requestedVerbosity = '') {
    console.log(`${message}: ${messageVerbosity}/${requestedVerbosity}`);

    if (messageVerbosity.length <= requestedVerbosity.length) {
        console.log(message);
    }
}

/**
 * @param {string} requestedVerbosity 
 * @returns {function(string, string)}
 */
exports.makeLogger = function (requestedVerbosity = '') {
    return function (m, v) {
        exports.output(m, v, requestedVerbosity)
    };
}