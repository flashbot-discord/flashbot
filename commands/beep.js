/**
 * @name beep.js
 * @description beep - boop
 */

var i18n = require('i18n');

const c = require('../classes');
const obj = new c.Command();

obj.name = 'beep';
obj.dev = false;
obj.callSign = ['beep'];
obj.args = [];

obj.execute = (msg) => {
    msg.channel.send(i18n.__('commands.beep.execute'));
};

module.exports = obj;