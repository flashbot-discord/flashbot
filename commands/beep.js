/**
 * @name beep.js
 * @description beep - boop
 */

exports.name = 'beep';
exports.desc = 'boop';
exports.dev = false;
exports.execute = (msg, args) => {
    msg.channel.send('boop');
};