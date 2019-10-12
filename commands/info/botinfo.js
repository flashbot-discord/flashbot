/**
 * @name botinfo.js
 * @description 봇 정보 보여주는 명령어
 */

const i18n = require('i18n');
const { Command } = require('discord.js-commando');

module.exports = class BotInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'botinfo',
            aliases: ['bot-info', '봇정보'],
            group: 'info',
            memberName: 'botinfo',
            description: '...'
        });
    }

    async run(msg) {
        
    }
}