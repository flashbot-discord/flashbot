const { MessageEmbed } = require('discord.js')
const ch = require('child_process')

const Command = require('../../structures/Command')
const canSendEmbed = require('../../modules/canSendEmbed')

class ExecuteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'exec',
      aliases: ['execute', 'ㄷㅌㄷㅊ', 'ㄷㅌㄷ쳣ㄷ'],
      description: 'commands.exec.DESC:Execute shell commands.',
      group: 'dev',
      owner: true,
      args: [
        {
          name: 'commands.exec.args.cmd.NAME:command',
          type: 'common.string:string',
          description: 'commands.exec.args.cmd.DESC:The command to run on the shell.'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t

    const str = query.args.join(' ')
    if (!str) return await msg.reply(Command.makeUsage(this, query.cmd, locale))
    client.logger.log('Command / Exec', '[EXEC] ' + msg.author.tag + ' executed the command: ' + str)

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

    client.logger.debug('Command / Exec', '[EXEC] Result: ' + result)

    if (result.length > 1000) useEmbed = false
    const moreText = '\nAnd much more...'

    if (useEmbed) {
      const _str = str.length > 1000 ? str.slice(0, 1000) + moreText : str
      const embed = new MessageEmbed()
        .setTitle(t('commands.exec.title', locale))
        .addField(t('commands.exec.input', locale), '```\n' + _str + '\n```')
        .addField(t('commands.exec.output', locale), '```\n' + result + '\n```')
      error ? embed.setColor(0xff0000) : embed.setColor(0x00ff00)

      return m.edit({ content: '', embed })
    } else {
      const _str = str.length > 150 ? str.slice(0, 150) + moreText : str
      const _result = result.length > 1750 ? result.slice(0, 1750) + moreText : result
      return m.edit(t('commands.exec.input', locale) + '```\n' +
        _str + '\n```\n' +
        t('commands.exec.output', locale) + '```\n' +
        _result + '\n```'
      )
    }
  }

  async execute (cmd) {
    return new Promise((resolve, reject) => {
      ch.exec(cmd, (err, stdout, stderr) => {
        console.log(stdout, stderr)
        if (err) reject(new Error(err + '\n' + stdout))
        else resolve(stdout)
      })
    })
  }
}

module.exports = ExecuteCommand
