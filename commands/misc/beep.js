/**
 * @name beep.js
 * @description beep - boop
 */

var i18n = require('i18n');

const { Command } = require('discord.js-commando');

module.exports = class BeepCommand extends Command {
    constructor(client) {
		super(client, {
			name: 'beep',
			group: 'misc',
			memberName: 'beep',
			description: 'boop'
		});
	}

	run(msg) {
		return msg.channel.send(i18n.__('commands.beep.execute'));
	}
};