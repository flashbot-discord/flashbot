/**
 * @name ping.js
 * @description Pong!
 */
exports.name = 'ping';
exports.desc = 'Pong!';
exports.dev = false;
exports.execute = (msg) => {
    msg.reply('Pong!');
}