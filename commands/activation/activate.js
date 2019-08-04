const { Command } = require('discord.js-commando');

module.exports = class ActivateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'activate',
            aliases: ['act', '활성화'],
            group: 'activation',
            memberName: 'activate',
            description: 'Activate this bot on the server',
            userPermissions: ['ADMINISTRATOR']
        })
    }

    run(msg) {
        msg.channel.send('');
    }
}