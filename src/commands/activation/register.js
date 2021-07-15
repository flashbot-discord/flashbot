const Command = require('../_Command')
const ClientError = require('../../structures/ClientError')
const database = require('../../database')
const logger = require('../../shared/logger')('cmd:register')

class RegisterCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'register',
      aliases: ['등록', '가입', 'ㄱㄷ햔ㅅㄷㄱ', 'emdfhr', 'rkdlq'],
      group: 'activation',
      requireDB: true
    })
  }

  async run (client, msg, args, { t }) {
    const isRegistered = await database.users.isRegistered(client.db, msg.author.id)
    if (isRegistered) return msg.reply(t('commands.register.alreadyRegistered'))

    let result
    let done = false

    const mcFilter = (m) => {
      if (m.author.id === msg.author.id) {
        const content = m.content.toLowerCase()
        if (content !== 'yes' && content !== 'no') return false
        else if (content === 'yes') result = true
        else if (content === 'no') result = false
        return true
      } else return false
    }

    const rcFilter = (reaction, user) => {
      if (user.id === msg.author.id) {
        if (reaction.emoji.name !== '✅' && reaction.emoji.name !== '❌') return false
        else if (reaction.emoji.name === '✅') result = true
        else if (reaction.emoji.name === '❌') result = false
        return true
      } else return false
    }

    const botMsg = await msg.channel.send(t('commands.register.title') + '\n\n' +
      t('commands.register.content') + '\n\n' +
      t('commands.register.confirm'))

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      msg.channel.send(t('commands.register.reactFail', t('perms.ADD_REACTIONS')))
    }

    const pend = async (c) => {
      if (done) return

      if (c.size > 0 && result) {
        await this.agree(msg, t)
      } else {
        this.deny(msg, t)
      }

      done = true
    }

    // Message Collector
    msg.channel.awaitMessages(mcFilter, { time: 15000, max: 1 }).then(pend)

    // Reaction Collector
    botMsg.awaitReactions(rcFilter, { time: 15000, max: 1 }).then(pend)
  }

  async agree (msg, t) {
    const loggerFn = logger.extend('agree')

    // Activation
    try {
      await database.users.register(this._client.db, {
        id: msg.author.id
      })
    } catch (err) {
      const e = new ClientError(err)
      e.report(msg, t, 'cmd:register.agree')
    }

    // Done!
    loggerFn.log(`[User Registration] ${msg.author.tag} (${msg.member.nickname}) has been registered`)
    msg.channel.send(t('commands.register.agree', this._client.config.prefix))
  }

  deny (msg, t) {
    msg.channel.send(t('commands.register.deny'))
  }
}

module.exports = RegisterCommand
