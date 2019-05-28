module.exports = {
    name: 'args-info',
    desc: '명령어 인자 체크용',
    execute(msg, args) {
        if (!args.length) {
            return msg.reply('You didn\'t provide any arguments!');
        }
        msg.channel.send(`Command name: args-info\nArguments: ${args}`); // args-info hardcoded
    }
};