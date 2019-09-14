/**
 * @name beep.js
 * @description beep - boop
 */

var i18n = require('i18n');

const { Command } = require('discord.js-commando');
const serverActivated = require('../../utils/serverActivated');

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
		if(!serverActivated(msg)) return;

		return msg.channel.send(i18n.__('commands.beep.execute'));
	}
};