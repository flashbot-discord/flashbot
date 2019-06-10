/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const c = require('../classes');
const obj = new c.Command();

obj.name = 'say';
obj.desc = '사용자가 입력한 문장을 따라 말합니다.';
obj.dev = false;
obj.callSign = ['say', '말하기'];

obj.args = [
    new c.Args("말", "따라 말할 말", true)
];

obj.execute = (msg, input) => {
    if (!input.length) {
        return msg.reply('따라 말할 말을 입력해 주세요.');
    }
    msg.channel.send(input);
};

module.exports = obj;