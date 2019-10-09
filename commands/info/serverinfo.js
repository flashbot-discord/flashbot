/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const i18n = require('i18n');

const { Command } = require('discord.js-commando');
const serverActivated = require('../../utils/serverActivated');

module.exports = class ServerInfoCommand extends Command {
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

    run(msg) {
        if(!serverActivated(msg)) return;

        msg.channel.send(i18n.__('commands.serverinfo.result', msg.guild.name, msg.guild.memberCount));
    }
};