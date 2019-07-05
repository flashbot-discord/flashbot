const util = require('util');
const discord = require('discord.js');
const client = new discord.Client(); // for developing
const perm = require('../permission');
const config = require('../config.json');

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

/**
 * @name eval.js
 * @description 자바스크립트 명령어를 실행합니다.
 */

obj.name = 'eval';
/**
 * 자바스크립트 실행. 관리자 권한 가지고 있어야 사용 가능
 */
obj.dev = true;
obj.callSign = ['eval'];

/**
 * "JavaScript 코드", "실행할 JavaScript 코드"
 */
obj.args = [
    new c.Args('JavaScript Code', true)
];

obj.execute = (msg, input) => {
    if (perm.isAdmin(msg.member)) {
        try {
            var result = eval(input);
            //msg.reply(i18n.__('commands.eval.execute.result.input') + '\n```' + input + '```\n' + i18n.__('commands.eval.execute.result.output') + '\n```' + util.inspect(result, false, null, false) + '```');
            /**
             * @todo optimize code for long eval results
             */
            msg.reply(`${i18n.__('commands.eval.execute.result.input')}\n\`\`\`js\n${input}\`\`\`\n${i18n.__('commands.eval.execute.result.output')}\n\`\`\`${util.inspect(result, false, null, false)}\`\`\``);
            console.log(result);
        } catch (error) {
            msg.reply(error.stack);
            console.log(error);
        }
    } else {
        /**
         * 당신은 관리자 권한을 가지고 있지 않습니다!
         */
        msg.reply(i18n.__('commands.eval.execute.no_admin'));
    }
};

module.exports = obj;