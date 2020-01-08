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

	async run(msg) {
		if(!super.run(msg)) return;

		return msg.channel.send(await i18n.__ll('commands.beep.execute', msg.guild));
	}
};
