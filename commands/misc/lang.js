/**
 * @name lang.js
 * @description 설정된 언어 확인 및 변경
 */

const i18n = require('i18n');

const BotCommand = require('../../utils/BotCommand');

module.exports = class LangCommand extends BotCommand {
    constructor(client) {
        super(client, {
            name: 'lang',
            aliases: ['언어'],
            group: 'misc',
            memberName: 'lang',
            description: '',
            guildOnly: true,
            args: [
                {
                    key: 'language',
                    prompt: /*i18n.__('commands.lang.execute.get', i18n.getLocale())*/'test',
                    type: 'string',
                    default: ""
                }
            ]
        });
    }

    hasPerm(msg) {
        return msg.guild.member(msg.author).hasPermission('ADMINISTRATOR');
    }

    run(msg, {language}) {
        if(!super.run(msg)) return;

        if(language.length < 1) {
            return msg.say(i18n.__('commands.lang.execute.get', i18n.getLocale()));
        }
        else {
            if(this.hasPerm(msg)) {

            } else {
                return msg.reply('access denied. (needs translation)');
            }
        }
    }
}