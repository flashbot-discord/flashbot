const { MessageEmbed } = require('discord.js')
const Command = require('../../classes/Command')
const ch = require('child_process')

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

    let result; let error = false

    try {
      result = await this.execute(str)
    } catch (err) {
      result = err.message
      error = true
    }

    client.logger.debug('Command / Exec', '[EXEC] Result: ' + result)

    if (msg.channel.permissionsFor(client.user).has('EMBED_LINKS')) {
      const embed = new MessageEmbed()
        .setTitle(t('commands.exec.title', locale))
        .addField(t('commands.exec.input', locale), str)
        .addField(t('commands.exec.output', locale), '```\n' + result + '\n```')
      error ? embed.setColor(0xff0000) : embed.setColor(0x00ff00)

      return m.edit({ content: '', embed })
    } else {
      return m.edit(t('commands.exec.input', locale) + '```\n' +
        str + '\n```\n' +
        t('commands.exec.output', locale) + '```\n' +
        result + '\n```'
      )
    }
  }

  async execute (cmd) {
    return new Promise((resolve, reject) => {
      ch.exec(cmd, (err, stdout, stderr) => {
        if (err) reject(err)
        else resolve(stdout)
      })
    })
  }
}

module.exports = ExecuteCommand
