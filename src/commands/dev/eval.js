const { MessageEmbed } = require('discord.js')
const util = require('util')

const Command = require('../_Command')
const { canSendEmbed } = require('../../components/permissions/checker')
const logger = require('../../shared/logger')('cmd:eval')

class EvalCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'eval',
      aliases: ['evaluate', 'ㄷㅍ미', 'ㄷㅍ미ㅕㅁㅅㄷ'],
      group: 'dev',
      owner: true,
      args: {
        unsafe: {
          aliases: ['u'],
          type: 'boolean',
          optional: true
        },
        _: [
          {
            key: 'code',
            type: 'text',
            optional: false
          }
        ]
      }
    })
  }

  async run (client, msg, query, { t }) {
    // Unsafe mode check
    const isUnsafe = query.args.unsafe
    logger.debug(`isUnsafe = ${String(isUnsafe)}`)

    const str = query.args.code
    if (!str) return await msg.reply(Command.makeUsage(this, query.cmd, t))
    logger.log(`[EVAL] ${msg.author.tag} evaluated the code: ${str}`)
    if (isUnsafe) logger.log('[EVAL] CODE IS RUNNING WITH UNSAFE MODE; Sensetive data protection will be disabled for this eval session.')

    const m = await msg.reply('Evaling...')

    let bd
    let result = ''
    const error = { occured: false, obj: null }
    let useEmbed = canSendEmbed(client.user, msg.channel)

    if (!isUnsafe) bd = this.hideToken()

    try {
      const evaluated = await this.evaluate(msg, str, bd)
      result = util.inspect(evaluated, { depth: 0 })
    } catch (err) {
      if (err instanceof Error) {
        result = err.message
        error.obj = err
      } else result = err

      error.occured = true
    }

    if (!isUnsafe) this.restoreToken(bd)
    bd = null

    logger.log(`[EVAL] Result: ${error.obj ? error.obj.stack : result}`)

    if (result.length > 1000) useEmbed = false
    const moreText = '\nAnd much more...'

    if (useEmbed) {
      const _str = str.length > 1000 ? str.slice(0, 1000) + moreText : str
      const embed = new MessageEmbed()
        .setTitle(t('commands.eval.title'))
        .addField(t('commands.eval.input'), '```js\n' + _str + '\n```')
        .addField(t('commands.eval.output'), '```js\n' + result + '\n```')
      embed.setColor(error.occured ? 'RED' : 'GREEN')

      return m.edit({ content: '', embed })
    } else {
      const _str = str.length > 150 ? str.slice(0, 150) + moreText : str
      const _result = result.length > 1750 ? result.slice(0, 1750) + moreText : result
      const print = t('commands.eval.input') + '```js\n' +
        _str + '\n```\n' +
        t('commands.eval.output') + '```js\n' +
        _result + '\n```'

      return m.edit(print)
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
