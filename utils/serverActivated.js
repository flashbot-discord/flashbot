const owner = require('../config.json').owner;

/**
 * check if the server which from the messages is activated
 * @param {Message} msg 
 */
module.exports = function isServerActivated(msg) {
    if(owner.includes(msg.author.id)) return true;

    if (msg.client.provider.get(msg.guild.id, 'activate', false)) {
        return true;
    } else {
        msg.reply("The Bot is disabled in this server. Please `activate` to use it.");
        return false;
    }
};