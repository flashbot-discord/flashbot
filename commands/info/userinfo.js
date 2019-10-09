/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const i18n = require('i18n');

const { Command } = require('discord.js-commando');

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
            name: 'userinfo',
            aliases: ['user-info', '이용자정보', '사용자정보', '유저정보'],
			group: 'info',
			memberName: 'userinfo',
			description: '...'
		});
	}

	run(msg) {
		msg.channel.send(i18n.__('commands.userinfo.result', msg.author.username, msg.author.id));
	}
};