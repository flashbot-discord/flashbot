const { MessageEmbed } = require('discord.js')
const ch = require('child_process')

const Command = require('../_Command')
const { canSendEmbed } = require('../../components/permissions/checker')

const logger = require('../../shared/logger')('cmd:exec')

class ExecuteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'exec',
      aliases: ['execute', 'ㄷㅌㄷㅊ', 'ㄷㅌㄷ쳣ㄷ'],
      group: 'dev',
      owner: true,
      args: [
        {
          key: 'cmd',
          type: 'text',
          optional: false
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    const str = query.args.cmd

    logger.log(`[EXEC] ${msg.author.tag} executed the command: ${str}`)

    const m = await msg.reply('Executing...')

    let result
    let useEmbed = canSendEmbed(client.user, msg.channel)
    let error = false

    try {
      result = await this.execute(str)
    } catch (err) {
      result = err.message
      error = true
    }

    logger.debug('[EXEC] Result: ' + result)

    if (result.length > 1000) useEmbed = false
    const moreText = '\nAnd much more...'

    if (useEmbed) {
      const _str = str.length > 1000 ? str.slice(0, 1000) + moreText : str
      const embed = new MessageEmbed()
        .setTitle(t('commands.exec.title'))
        .addField(t('commands.exec.input'), '```\n' + _str + '\n```')
        .addField(t('commands.exec.output'), '```\n' + result + '\n```')
      embed.setColor(error ? 'RED' : 'GREEN')

      return m.edit({ content: '', embed })
    } else {
      const _str = str.length > 150 ? str.slice(0, 150) + moreText : str
      const _result = result.length > 1750 ? result.slice(0, 1750) + moreText : result
      return m.edit(t('commands.exec.input') + '```\n' +
        _str + '\n```\n' +
        t('commands.exec.output') + '```\n' +
        _result + '\n```'
      )
    }
  }

  async execute (cmd) {
    return new Promise((resolve, reject) => {
      ch.exec(cmd, (err, stdout, stderr) => {
        if (err) reject(new Error(err + '\n' + stdout))
        else resolve(stdout)
      })
    })
  }
}

module.exports = ExecuteCommand
