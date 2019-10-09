const owner = require('../config.json').owner;

const { Command } = require('discord.js-commando');

module.exports = class BotCommand extends Command {
    constructor(client, info) {
        super(client, info);
    }

    run(msg) {
        if (!msg.guild) return true; // DM
        if (owner.includes(msg.author.id)) return true; // owner bypass

        // Server activation status check
        if (msg.client.provider.get(msg.guild.id, 'activate', false)) {
            return true;
        } else {
            msg.reply("The Bot is disabled in this server. Please `activate` to use it.");
            return false;
        }
    }
};