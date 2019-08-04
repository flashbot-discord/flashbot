const { Command } = require('discord.js-commando');

module.exports = class DeactivateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deactivate',
            aliases: ['deact', '비활성화'],
            group: 'activation',
            memberName: 'deactivate',
            description: 'Deactivate this bot on the server',
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true
        })
    }

    run(msg) {
        msg.client.provider.set(msg.guild, 'activate', false);

        msg.channel.send('deactivation conplete (needs translation / testing)');
    }
}