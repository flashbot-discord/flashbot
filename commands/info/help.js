const { MessageEmbed } = require('discord.js')
const Command = require('../../classes/Command')

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: 'commands.help.DESC:Shows help message.',
      aliases: ['도움', '도움말', 'ㅗ디ㅔ', 'ehdna', 'ehdnaakf'],
      args: [
        {
          name: 'commands.help.args.command.NAME:command',
          description: 'commands.help.args.command.DESC:Shows information about that command.',
          type: 'common.string:string',
          optional: true
        }
      ]
    })
  }

  async run(client, msg, query, locale) {
    const t = client.locale.t

    let dm = true
    if(msg.guild && query.args.includes('--here')) dm = false

    // TODO Embed
    const embed = new MessageEmbed()
      .setTitle(t('commands.help.title', locale))
      .setDescription(t('commands.help.desc', locale))

    client.commands.commands.forEach((command) => {
      embed.addField(client.config.prefix + command._name, t(command._desc, locale))
    })

    //const str = t('commands.help.titleNoEmbed', locale)

    if(dm) {
      msg.author.send(embed)
      if(msg.guild) await msg.reply(t('commands.help.sentToDM:Sent the help messages to your DM.', locale))
    } else await msg.channel.send(embed)
  }
}

module.exports = HelpCommand
