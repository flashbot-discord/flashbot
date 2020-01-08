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
            args: [
                {
                    key: "args",
                    prompt: "Enter argument to parse.",
                    type: "string",
                    infinite: true
                }
            ]
        });
    }

    async run(msg, args) {
        if (!args.args.length) {
            /**
             * 인수가 입력되지 않았습니다.
             */
            return msg.reply(await i18n.__ll('commands.args-info.execute.no_args', msg.guild));
        }
        /**
         * Command name: args-info
         * ----
         * Arguments: %s
         */
        msg.channel.send(await i18n.__ll('commands.args-info.execute.result.cmd_name', msg.guild) + '\n' + i18n.__('commands.args-info.execute.result.cmd_args', args.args + '')); // args-info hardcoded
    }
};
