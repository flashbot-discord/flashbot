/**
 * @name ping.js
 * @description Pong!
 */

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

obj.name = 'ping';
/**
 * Pong!
 */
obj.dev = false;
obj.callSign = ['ping', '핑'];

obj.args = [];

obj.execute = (msg) => {
    /**
     * Pong!
     */
    msg.reply(i18n.__('commands.ping.execute'));
};

module.exports = obj;