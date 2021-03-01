const { MessageEmbed } = require('discord.js')

const Paginator = require('../../structures/Paginator')
const Command = require('../_Command')

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      aliases: ['도움', '도움말', 'ㅗ디ㅔ', 'ehdna', 'ehdnaakf'],
      group: 'info',
      args: {
        dm: {
          aliases: ['d', '디엠'],
          type: 'boolean',
          optional: true
        },
        'no-page': {
          aliases: ['n', 'nopage', '페이지끄기', '노페이지', '페이지안씀'],
          type: 'boolean',
          optional: true
        },

        _: [
          {
            key: 'command',
            type: 'string',
            optional: true
          }
        ]
      }
    })
  }

  async run (client, msg, query, { t }) {
    // is DM
    const dm = !msg.guild || query.args.dm

    if (!query.args.command) {
      // Enable/Disable Page
      const page = !query.args['no-page'] &&
        (dm || msg.channel.permissionsFor(client.user).has('ADD_REACTIONS'))

      // FIXME: Not working on embed-unable channel
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

      if (dm && msg.guild) await msg.reply(t('commands.help.sentToDM'))
    } else {
      // NOTE: Specific command help
      const cmdText = query.args.command
      const cmd = client.commands.get(cmdText)
      if (!cmd) return

      const fakeQueryObj = {
        prefix: query.prefix,
        cmd: cmdText
      }
      const desc = cmd._translateDesc(t)

      let botPermsText = cmd._clientPerms.length > 0
        ? ''
        : t('commands.help.cmdhelp.perms.none')
      cmd._clientPerms.forEach((perm, idx) => {
        let last = idx === cmd._clientPerms.length - 1
        if (last) botPermsText += t('commands.help.cmdhelp.perms.or') + ' '
        botPermsText += t(`perms.${perm}`) + (last ? '' : ', ')
      })

      let userPermsText = cmd._userPerms.length > 0
        ? ''
        : t('commands.help.cmdhelp.perms.none')
      cmd._userPerms.forEach((perm, idx) => {
        let last = idx === cmd._userPerms.length - 1
        if (last) userPermsText += t('commands.help.cmdhelp.perms.or') + ' '
        userPermsText += `\`${t(`perms.${perm}`)}\`${last ? '' : ', '}`
      })

      const embed = new MessageEmbed()
        .setTitle(t('commands.help.cmdhelp.title', {
          cmdcall: `${fakeQueryObj.prefix}${fakeQueryObj.cmd}`
        }))
        .setDescription(desc)
        .addField(t('commands.help.cmdhelp.requiredBotPerms'), botPermsText, true)
        .addField(t('commands.help.cmdhelp.requiredUserPerms'), userPermsText, true)
        .addField(t('commands.help.cmdhelp.ownerOnly'), cmd._owner ? ':o:' : ':x:', true)
        .addField(t('commands.help.cmdhelp.usage'), `\`\`\`\n${Command.makeUsage(cmd, fakeQueryObj, t)}\n\`\`\``)

      msg.channel.send(embed)
    }
  }
}

module.exports = HelpCommand
