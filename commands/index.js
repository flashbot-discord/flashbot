const ping = require('./ping');
const _eval = require('./eval');
const args_info = require('./args-info');
const help = require('./help');
const beep = require('./beep');
const serverinfo = require('./serverinfo');
const userinfo = require('./userinfo');

module.exports = {
    eval: _eval,
    ping: ping,
    args_info: args_info,
    help: help,
    beep: beep,
    serverinfo: serverinfo,
    userinfo: userinfo
};