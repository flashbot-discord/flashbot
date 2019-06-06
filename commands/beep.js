/**
 * @name beep.js
 * @description beep - boop
 */

exports.name = 'beep';
exports.desc = 'boop';
exports.dev = false;
exports.callSign = ['beep'];

exports.args = [];

exports.execute = (msg) => {
    msg.channel.send('boop');
};