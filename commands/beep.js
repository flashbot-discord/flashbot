/**
 * @name beep.js
 * @description beep - boop
 */

/*
exports.name = 'beep';
exports.desc = 'boop';
exports.dev = false;
exports.callSign = ['beep'];

exports.args = [];

exports.execute = (msg) => {
   msg.channel.send('boop');
};
*/

const c = require('../classes');
const obj = new c.command();

obj.name = 'beep';
obj.desc = 'boop';
obj.dev = false;
obj.callSign = ['beep'];
obj.args = [];

obj.execute = (msg) => {
    msg.channel.send('boop');
};

module.exports = obj;