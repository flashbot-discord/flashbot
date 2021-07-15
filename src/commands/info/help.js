const { MessageEmbed } = require('discord.js')

// const Paginator = require('../../structures/Paginator')
const Command = require('../_Command')
const { joinBacktick } = require('../../shared/textFormat')
const makeCommandUsage = require('../../structures/command/usage')

const LINKS = {
  main: 'https://flashbot.ga',
  docs: 'https://docs.flashbot.ga',
  support: 'https://discord.gg/epY3waF'
}

class HelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      aliases: ['도움', '도움말', 'ㅗ디ㅔ', 'ehdna', 'ehdnaakf'],
      group: 'info',
      args: [
        {
          key: 'command',
          type: 'string',
          optional: true
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    const useEmbed = !query.args['no-embed'] && msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    if (!query.args.command) {
      const makeLinkText = () => {
        let text = ''
        for (const linkName in LINKS) {
          const link = LINKS[linkName]
          const translated = t(`commands.help.links.${linkName}`)
          text += useEmbed
            ? `:link: [${translated}](${link})\n`
            : `:link: ${translated}: ${link}\n`
        }

        return text
      }

      let mainData
      if (useEmbed) {
        const footerText = t('commands.help.footer', client.VERSION)

        const mainEmbed = new MessageEmbed()
          .setTitle(t('commands.help.title'))
          .setDescription(t('commands.help.firstMsg', {
            prefix: query.prefix,
            cmdcall: query.cmd
          }))
          .setFooter(footerText)

        client.commands.groups.forEach((cmdList, group) => {
          if (group === 'dev') return
          mainEmbed.addField(t(`commandGroup.${group}`), `\`${cmdList.join('`, `')}\``)
        })

        mainEmbed.addField(t('commands.help.links.TITLE'), makeLinkText())
        mainData = mainEmbed
      } else {
        const title = t('commands.help.title')
        const desc = t('commands.help.firstMsg', {
          prefix: query.prefix,
          cmdcall: query.cmd
        })
        const linkText = `__${t('commands.help.links.TITLE')}__\n${makeLinkText()}`

        let cmdListText = ''
        client.commands.groups.forEach((cmdList, group) => {
          if (group === 'dev') return
          cmdListText += `__${t(`commandGroup.${group}`)}__\n` + `\`${cmdList.join('`, `')}\`\n`
        })

        mainData = `**${title}**\n\n${desc}\n\n${cmdListText}\n${linkText}`
      }

      msg.channel.send(mainData)

      /*
      // FIXME: Not working on embed-unable channel
      // Embed Maker
      const contents = []

      const createContent = (group, currentPage, totalPage, isFirst) => {
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

      contents.push(createEmbed('info', 1, 5, true))
      contents.push(createEmbed('activation', 2, 5, page))
      contents.push(createEmbed('util', 3, 5, page))
      contents.push(createEmbed('settings', 4, 5, page))
      contents.push(createEmbed('misc', 5, 5, page))

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
      */
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

      const aliasesText = cmd._aliases.length > 0
        ? joinBacktick(cmd._aliases)
        : t('commands.help.cmdhelp.noAlias')

      let botPermsText = ''
      if (cmd._clientPerms.length > 0) {
        const translatedPerms = cmd._clientPerms.map(perm => t(`perms.${perm}`))
        botPermsText = joinBacktick(translatedPerms)
      } else {
        botPermsText = t('commands.help.cmdhelp.perms.none')
      }

      let userPermsText = ''
      if (cmd._owner) {
        userPermsText = `**${t('commands.help.cmdhelp.perms.owner')}**`
      } else if (cmd._userPerms.length > 0) {
        const translatedPerms = cmd._userPerms.map(perm => t(`perms.${perm}`))
        userPermsText = joinBacktick(translatedPerms)
      } else {
        userPermsText = t('commands.help.cmdhelp.perms.none')
      }

      const titleTxt = t('commands.help.cmdhelp.title', {
        cmdcall: `${fakeQueryObj.prefix}${fakeQueryObj.cmd}`
      })
      const aliasesTitleTxt = t('commands.help.cmdhelp.aliases')
      const requiredBotPermsTxt = t('commands.help.cmdhelp.requiredBotPerms')
      const requiredUserPermsTxt = t('commands.help.cmdhelp.requiredUserPerms')
      const usageTxt = t('commands.help.cmdhelp.usage')
      const usage = makeCommandUsage(msg, cmd, fakeQueryObj, t)

      let output
      if (useEmbed) {
        const embed = new MessageEmbed()
          .setTitle(titleTxt)
          .setDescription(desc)
          .addField(aliasesTitleTxt, aliasesText)
          .addField(requiredBotPermsTxt, botPermsText, true)
          .addField(requiredUserPermsTxt, userPermsText, true)
          .addField(usageTxt, `\`\`\`\n${usage}\n\`\`\``)

        output = embed
      } else {
        const str =
`**${titleTxt}**
> ${desc}

${aliasesTitleTxt}: ${aliasesText}
${requiredBotPermsTxt}: ${botPermsText}
${requiredUserPermsTxt}: ${userPermsText}

\`\`\`
${usage}
\`\`\``

        output = str
      }

      msg.channel.send(output)
    }
  }
}

module.exports = HelpCommand
