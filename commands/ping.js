module.exports = {
    name: 'ping',
    desc: 'Pong!',
    dev: false,
    execute(msg, args) {
        msg.reply('Pong!');
    }
};