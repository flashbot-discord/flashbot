const args_info = function (msg, cmd, args) {
    if (!args.length) {
        return msg.reply('You didn\'t provide any arguments!');
    }
    msg.channel.send(`Command name: ${cmd}\nArguments: ${args}`);
}

module.exports = args_info;