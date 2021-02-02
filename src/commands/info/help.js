const { MessageEmbed } = require('discord.js')

const Paginator = require('../../structures/Paginator')
const Command = require('../_Command')

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      description: 'commands.help.DESC:Shows help message.',
      aliases: ['도움', '도움말', 'ㅗ디ㅔ', 'ehdna', 'ehdnaakf'],
      group: 'info',
      args: {
        here: {
          aliases: ['h', 'ㅗㄷㄱㄷ', 'ㅗ'],
          description: 'desc',
          type: 'boolean',
          optional: true
        },
        'no-page': {
          aliases: ['n', 'nopage', 'ㅜㅐ-ㅔㅁㅎㄷ', 'ㅜ', 'ㅜㅐㅔㅁㅎㄷ'],
          description: 'desc2',
          type: 'boolean',
          optional: true
        },

        _: [
          {
            key: 'command',
            description: 'commands.help.args.command.DESC:Shows information about that command.',
            type: 'string',
            optional: true
          }
        ]
      }
    })
  }

  async run (client, msg, query, { t }) {
    // is DM
    const dm = !msg.guild || !query.args.here

    // Enable/Disable Page
    const page = (!query.args['no-page'] &&
      (dm || msg.channel.permissionsFor(client.user).has('ADD_REACTIONS')))

    // Embed Maker
    const embeds = []
    const createEmbed = (group, currentPage, totalPage, isFirst) => {
      const embed = new MessageEmbed()
      if (isFirst) {
        embed.setTitle(t('commands.help.title'))

        const groupT = t('commandGroup.' + group)
        if (page) embed.setDescription(t('commands.help.desc', groupT, currentPage, totalPage))
        else embed.setDescription(t('commands.help.descNoPage', groupT))
      } else {
        embed.setDescription(t('commands.help.descNoPage', t('commandGroup.' + group)))
      }

      if (page) embed.setFooter(t('commands.help.footer', client.VERSION))
      else embed.setFooter(t('commands.help.footerNoPage', client.VERSION))

      client.commands.groups.get(group).forEach((c) => {
        const cmd = client.commands.get(c)
        embed.addField(client.config.prefix + cmd._name, t(cmd._desc))
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
      if (msg.guild) await msg.reply(t('commands.help.sentToDM'))
    }
  }
}

module.exports = HelpCommand
