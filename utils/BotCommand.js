const { Command } = require('discord.js-commando')

module.exports = class BotCommand extends Command {
  constructor (client, info) {
    super(client, info)
  }

  async run (msg) {
    if (!msg.guild) return true // DM
    if (msg.client.isOwner(msg.author.id)) return true // owner bypass

    // Server activation status check
    const check = await msg.client.provider.get('guilds', msg.guild.id, 'activated')
    if (check.length > 0) {
	    if (check[0].activated) return true
      else {
        msg.reply('The Bot is disabled in this server. Please `activate` to use it.')
        return false
	    }
    } else return false // TODO not registered
  }
}
