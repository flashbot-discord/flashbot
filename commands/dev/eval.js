const { MessageEmbed } = require('discord.js')
const Command = require('../../classes/Command')
const util = require('util')

class EvalCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'eval',
      aliases: ['evaluate', 'ㄷㅍ미', 'ㄷㅍ미ㅕㅁㅅㄷ'],
      description: 'commands.eval.DESC:Evaluates a code.',
      group: 'dev',
      owner: true,
      args: [
        {
          name: 'commands.eval.args.code.NAME:code',
          type: 'common.string:string',
          description: 'commands.eval.args.code.DESC:The code to evaluate.'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t

    // Unsafe mode check
    let isUnsafe = false
    if (['-u', '--unsafe'].includes(query.args[0])) {
      isUnsafe = true
      query.args = query.args.slice(1)
    }

    const str = query.args.join(' ')
    if (!str) return await msg.reply(Command.makeUsage(this, query.cmd, locale))
    client.logger.log('Command / Eval', '[EVAL] ' + msg.author.tag + ' evaluated the code: ' + str)

    const m = await msg.reply('Evaling...')

    let bd
    let result
    let error = false
    let useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    if (!isUnsafe) bd = this.hideToken()

    try {
      const evaluated = await this.evaluate(msg, str, bd)
      result = util.inspect(evaluated, { depth: 0 })
    } catch (err) {
      result = err.message
      error = true
    }

    if (!isUnsafe) this.restoreToken(bd)
    bd = null

    client.logger.debug('Command / Eval', '[EVAL] Result: ' + result)

    if (result.length > 1000) useEmbed = false

    if (useEmbed) {
      const embed = new MessageEmbed()
        .setTitle(t('commands.eval.title', locale))
        .addField(t('commands.eval.input', locale), '```\n' + str + '\n```')
        .addField(t('commands.eval.output', locale), '```\n' + result + '\n```')
      error ? embed.setColor(0xff0000) : embed.setColor(0x00ff00)

      return m.edit({ content: '', embed })
    } else {
      return m.edit(t('commands.eval.input', locale) + '```\n' +
        str + '\n```\n' +
        t('commands.eval.output', locale) + '```\n' +
        result + '\n```'
      )
    }
  }

  async evaluate (msg, code) {
    // Helpers
    /* eslint-disable no-unused-vars */
    const client = msg.client
    const guild = msg.guild
    const channel = msg.channel
    const author = msg.author
    const member = msg.member
    const Discord = require('discord.js')
    const childProcess = require('child_process')
    const fs = require('fs')
    const os = require('os')
    const jsondb = msg.client.db.obj
    const knex = msg.client.db.knex
    /* eslint-enable no-unused-vars */

    return new Promise((resolve, reject) => {
      let result
      try {
        // eslint-disable-next-line no-eval
        result = eval(code)
        resolve(result)
      } catch (err) { reject(err) }
    })
  }

  hideToken () {
    // Temporaily remove token from visible area
    const d = {}
    Object.defineProperty(d, '__SECRET__DATA__', {
      value: this._client.token
    })
    this._client.token = this._client.config.token = '403 Forbidden'

    return d
  }

  restoreToken (d) {
    // Restore token
    this._client.token = this._client.config.token = d.__SECRET__DATA__
  }
}

module.exports = EvalCommand
