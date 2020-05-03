const { MessageEmbed } = require('discord.js')
const EZPaginator = require('ez-paginator')
const Command = require('../../classes/Command')

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: 'commands.help.DESC:Shows help message.',
      aliases: ['도움', '도움말', 'ㅗ디ㅔ', 'ehdna', 'ehdnaakf'],
      group: 'info',
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
    if(msg.guild && (query.args.includes('--here') || query.args.includes('-h'))) dm = false

    // TODO Embed
    const embeds = []
    const createEmbed = (group, currentPage, totalPage) => {
      const embed = new MessageEmbed()
        .setTitle(t('commands.help.title', locale))
        .setDescription(t('commands.help.desc', locale, t('commandGroup.' + group, locale), currentPage, totalPage))
        .setFooter(t('commands.help.footer', locale))
      client.commands.groups.get(group).forEach((c) => {
        const cmd = client.commands.get(c)
        embed.addField(client.config.prefix + cmd._name, t(cmd._desc, locale))
      })
      return embed
    }

    embeds.push(createEmbed('info', 1, 3))
    embeds.push(createEmbed('activation', 2, 3))
    embeds.push(createEmbed('misc', 3, 3))

    let message
    if(dm) message = await msg.author.send(embeds[0])
    else message = await msg.channel.send(embeds[0])

    const paginator = new EZPaginator({
      client,
      msg: message,
      embeds,
      moreReactions: true
    })

    /*
    client.commands.commands.forEach((command) => {
      embed.addField(client.config.prefix + command._name, t(command._desc, locale))
    })
    */

    //const str = t('commands.help.titleNoEmbed', locale)

    paginator.start()
    if(dm) {
      if(msg.guild) await msg.reply(t('commands.help.sentToDM:Sent the help messages to your DM.', locale))
    }
  }
}

module.exports = HelpCommand
