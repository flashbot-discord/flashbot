/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const i18n = require('i18n');

const { Command } = require('discord.js-commando');
const BotCommand = require('../../utils/BotCommand');

module.exports = class ServerInfoCommand extends BotCommand {
    constructor(client) {
        super(client, {
            name: 'serverinfo',
            aliases: ['server-info', '서버정보'],
            group: 'info',
            memberName: 'serverinfo',
            description: '...',
            guildOnly: true
        });
    }

    async run(msg) {
        if (!super.run(msg)) return;

        msg.channel.send(i18n.__({
            phrase: 'commands.serverinfo.result',
            locale: await msg.client.getGuildLocale(msg.guild)
        }, msg.guild, msg.guild.name, msg.guild.memberCount));
    }
};
