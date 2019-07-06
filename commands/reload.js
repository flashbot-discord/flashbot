/**
 * @name reload.js
 * @description 명령어 재 로드
 * @todo 현재 작동하지 않음
 */

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

obj.name = 'reload';
obj.dev = true;
obj.callSign = ['reload'];

obj.args = [
    /**
     * "명령어", "다시 로드할 명령어의 이름"
     */
    new c.Args('commands', true)
];

obj.execute = (msg, args) => {
    if(args.length < 1) {
        /**
         * 다시 로드할 명령어를 입력해 주세요. (현재 작동되지 않음)
         */
        return msg.reply(i18n.__('commands.reload.execute.no_args'));
    }
    delete require.cache[require.resolve(`./${args[1]}`)];
    require(`./${args[1]}`);
    /**
     * %s이(가) 다시 로드되었습니다! (현재 작동되지 않음) | %s = args[1]
     */
    msg.channel.send(i18n.__('commands.reload.execute.success', args[1]));
};

module.exports = obj;