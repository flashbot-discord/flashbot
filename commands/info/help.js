const { MessageEmbed } = require('discord.js')
const minimist = require('minimist')

const Paginator = require('../../classes/Paginator')
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
    const args = minimist(query.args, {
      boolean: ['here', 'no-page'],
      alias: {
        here: ['h', 'ㅗㄷㄱㄷ', 'ㅗ'],
        'no-page': ['n', 'ㅜㅐ-ㅔㅁㅎㄷ', 'ㅜ']
      }
    })

    // is DM
    let dm = true
    if (msg.guild && args.here) dm = false

    // Enable/Disable Page
    let page = true
    if (dm ||
      args['no-page'] ||
      (!dm && !msg.channel.permissionsFor(msg.guild.me).has('ADD_REACTIONS'))) page = false

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

    embeds.push(createEmbed('info', 1, 5, true))
    embeds.push(createEmbed('activation', 2, 5, page))
    embeds.push(createEmbed('util', 3, 5, page))
    embeds.push(createEmbed('settings', 4, 5, page))
    embeds.push(createEmbed('misc', 5, 5, page))

    // Start Paginator
    if (page) {
      let message
      if (dm) message = await msg.author.send('Loading...')
      else message = await msg.channel.send('Loading...')

      const paginator = new Paginator(client, message, {
        contents: embeds,
        userID: msg.author.id
      })

      paginator.start()
    } else {
      embeds.forEach(async (embed) => {
        if (dm) await msg.author.send(embed)
        else await msg.channel.send(embed)
      })
    }
    if (dm) {
      if (msg.guild) await msg.reply(t('commands.help.sentToDM', locale))
    }
  }
}

module.exports = HelpCommand
