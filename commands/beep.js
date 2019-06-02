module.exports = {
    name: 'beep',
    desc: 'boop',
    dev: false,
    execute(msg, args) {
        msg.channel.send('boop');
    }
};