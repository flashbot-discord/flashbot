const { Command } = require('discord.js-commando');

module.exports = class TestCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'test',
            aliases: ['테스트'],
            group: 'dev',
            memberName: 'test',
            description: 'Command Testing',
            ownerOnly: true
        });
    }

    run(msg) {
        // Enter your code to test
        msg.channel.send('testing the command');
    }
}