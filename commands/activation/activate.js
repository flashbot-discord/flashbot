const { Command } = require('discord.js-commando');
const i18n = require('i18n');

module.exports = class ActivateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'activate',
            aliases: ['act', '활성화'],
            group: 'activation',
            memberName: 'activate',
            description: 'Activate this bot on the server',
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true
        })
    }

    run(msg) {
        msg.client.provider.set(msg.guild, 'activate', true);

        msg.channel.send('activation complete (needs translation / testing)');
        msg.channel.send(i18n.__('commands.activate.execute.1'));
    }
}