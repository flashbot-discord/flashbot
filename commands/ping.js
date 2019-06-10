/**
 * @name ping.js
 * @description Pong!
 */

const c = require('../classes');
const obj = new c.Command();

obj.name = 'ping';
obj.desc = 'Pong!';
obj.dev = false;
obj.callSign = ['ping', '핑'];

obj.args = [];

obj.execute = (msg) => {
    msg.reply('Pong!');
};

module.exports = obj;