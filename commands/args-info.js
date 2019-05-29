module.exports = {
    name: 'args-info',
    desc: '명령어 인자 체크용',
    dev: true,
    execute(msg, args) {
        if (!args.length) {
            return msg.reply('인수가 입력되지 않았습니다.');
        }
        msg.channel.send(`Command name: args-info\nArguments: ${args}`); // args-info hardcoded
    }
};