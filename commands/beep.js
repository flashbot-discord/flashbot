module.exports = {
    name: 'beep',
    desc: 'boop',
    execute(msg, args) {
        msg.channel.send('boop');
    }
};