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

    let bd, result
    if (!isUnsafe) bd = this.hideToken()

    try {
      const evaluated = await this.evaluate(msg, str, bd)
      result = util.inspect(evaluated, { depth: 0 })
    } catch (err) {
      result = err.message
    }

    if (!isUnsafe) this.restoreToken(bd)
    bd = null

    client.logger.debug('Command / Eval', '[EVAL] Result: ' + result)
    return await m.edit(client.locale.t('commands.eval.input:Input:', locale) + '```\n' +
      str + '\n```\n' +
      client.locale.t('commands.eval.output:and Output:', locale) + '```\n' +
      result + '\n```')
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

    // eslint-disable-next-line no-eval
    return new Promise((resolve) => resolve(eval(code)))
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
