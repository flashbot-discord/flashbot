/**
 * @name ping.js
 * @description Pong!
 */
exports.name = 'ping';
exports.desc = 'Pong!';
exports.dev = false;
exports.callSign = ['ping', '핑'];

exports.execute = (msg) => {
    msg.reply('Pong!');
}