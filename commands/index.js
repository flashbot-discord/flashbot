var ping = require('./ping');
var _eval = require('./eval');
var args_info = require('./args-info');

module.exports = {
    eval: _eval,
    ping: ping,
    args_info: args_info
};