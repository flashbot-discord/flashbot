/**
 * @name args-info.js
 * @description 입력된 인수를 체크하는 명령어입니다.
 */
const i18n = require('i18n');

const { Command } = require('discord.js-commando');

module.exports = class ArgsInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'args-info',
            aliases: ['argsinfo'],
            group: 'dev',
            memberName: 'args-info',
            description: '',
        });
    }

    run(msg) {
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
    }
};