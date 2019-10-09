/**
 * @name beep.js
 * @description beep - boop
 */

var i18n = require('i18n');

const BotCommand = require('../../utils/BotCommand');

module.exports = class BeepCommand extends BotCommand {
    constructor(client) {
		super(client, {
			name: 'beep',
			group: 'misc',
			memberName: 'beep',
			description: 'boop'
		});
	}

	run(msg) {
		if(!super.run(msg)) return;

		return msg.channel.send(i18n.__('commands.beep.execute'));
	}
};