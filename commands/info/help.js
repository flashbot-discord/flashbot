const { MessageEmbed } = require('discord.js')
const EZPaginator = require('ez-paginator')
const Command = require('../../classes/Command')

class HelpCommand extends Command {
  constructor (client) {
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

  async run (client, msg, query, locale) {
    const t = client.locale.t

    // is DM
    let dm = true
    if (msg.guild && (
      query.args.includes('--here')
      || query.args.includes('--ㅗㄷㄱㄷ')
      || query.args.includes('-h')
      || query.args.includes('-ㅗ'))
    ) dm = false

    // Enable/Disable Page
    let page = true
    if (dm || query.args.includes('--no-page')
      || query.args.includes('--ㅜㅐ-ㅔㅁㅎㄷ')
      || query.args.includes('-n')
      || query.args.includes('-ㅜ')
    ) page = false

    // Embed Maker
    const embeds = []
    const createEmbed = (group, currentPage, totalPage, isFirst) => {
      const embed = new MessageEmbed()
      if (isFirst) {
        embed.setTitle(t('commands.help.title', locale))

        const groupT = t('commandGroup.' + group, locale)
        if (page) embed.setDescription(t('commands.help.desc', locale, groupT, currentPage, totalPage))
        else embed.setDescription(t('commands.help.descNoPage', locale, groupT))
      } else {
        embed.setDescription(t('commands.help.descNoPage', locale, t('commandGroup.' + group, locale)))
      }

      if (page) embed.setFooter(t('commands.help.footer', locale, client.VERSION))
      else embed.setFooter(t('commands.help.footerNoPage', locale, client.VERSION))

      client.commands.groups.get(group).forEach((c) => {
        const cmd = client.commands.get(c)
        embed.addField(client.config.prefix + cmd._name, t(cmd._desc, locale))
      })

      return embed
    }

    embeds.push(createEmbed('info', 1, 3, true))
    embeds.push(createEmbed('activation', 2, 3, page))
    embeds.push(createEmbed('misc', 3, 3, page))

    // Start Paginator
    if (page) {
      let message
      if (dm) message = await msg.author.send(embeds[0])
      else message = await msg.channel.send(embeds[0])

      const paginator = new EZPaginator({
        client,
        msg: message,
        embeds,
        moreReactions: true
      })

      paginator.start()
    } else {
      embeds.forEach(async (embed) => {
        if (dm) await msg.author.send(embed)
        else await msg.channel.send(embed)
      })
    }
    if (dm) {
      if (msg.guild) await msg.reply(t('commands.help.sentToDM:Sent the help messages to your DM.', locale))
    }
  }
}

module.exports = HelpCommand
