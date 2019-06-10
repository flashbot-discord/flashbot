/**
 * @name args-info.js
 * @description 입력된 인수를 체크하는 명령어입니다.
 */

const c = require('../classes');
const obj = new c.command();

obj.name = 'args-info';
obj.desc = '명령어 인자 체크용';
obj.dev = true;
obj.callSign = ['args-info', 'argsinfo'];

obj.args = [
    new c.args("인수", "테스트할 인수를 입력합니다.", true)
];

obj.execute = (msg, args) => {
    if (!args.length) {
        return msg.reply('인수가 입력되지 않았습니다.');
    }
    msg.channel.send(`Command name: args-info\nArguments: ${args}`); // args-info hardcoded
};

module.exports = obj;