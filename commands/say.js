/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

obj.name = 'say';
/**
 * 사용자가 입력한 문장을 따라 말합니다.
 */
obj.desc = 'commands.say.desc';
obj.dev = false;
obj.callSign = ['say', '말하기'];

obj.args = [
    /**
     * "말", "따라 말할 말"
     */
    new c.Args('commands.say.args.0.name', 'commands.say.args.0.desc', true)
];

obj.execute = (msg, input) => {
    if (!input.length) {
        /**
         * 따라 말할 말을 입력해 주세요.
         */
        return msg.reply(i18n.__('commands.say.execute.no_args'));
    }
    msg.channel.send(input);
};

module.exports = obj;