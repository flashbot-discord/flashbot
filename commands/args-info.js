/**
 * @name args-info.js
 * @description 입력된 인수를 체크하는 명령어입니다.
 */
const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

obj.name = 'args-info';
/**
 * for checking command arguments
 * 명령어 인자 체크용
 */
obj.desc = 'commands.args-info.desc';
obj.dev = true;
obj.callSign = ['args-info', 'argsinfo'];

obj.args = [
    /**
     * args
     * ----
     * 테스트할 인수를 입력합니다.
     */
    new c.Args("commands.args-info.args.0.name", "commands.args-info.args.0.desc", true)
];

obj.execute = (msg, args) => {
    if (!args.length) {
        /**
         * 인수가 입력되지 않았습니다.
         */
        return msg.reply(i18n.__('commands.args-info.execute.no_args'));
    }
    /**
     * Command name: args-info
     * ----
     * Arguments: %s
     */
    msg.channel.send(i18n.__('commands.args-info.execute.result.cmd_name') + '\n' + i18n.__('commands.args-info.execute.result.cmd_args', args + '')); // args-info hardcoded
};

module.exports = obj;