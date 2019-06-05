/**
 * @name args-info.js
 * @description 입력된 인수를 체크하는 명령어입니다.
 */

exports.name = 'args-info';
exports.desc = '명령어 인자 체크용';
exports.dev = true;
exports.execute = (msg, args) => {
    if (!args.length) {
        return msg.reply('인수가 입력되지 않았습니다.');
    }
    msg.channel.send(`Command name: args-info\nArguments: ${args}`); // args-info hardcoded
};