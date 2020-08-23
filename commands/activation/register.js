const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')
const database = require('../../database')

class RegisterCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'register',
      aliases: ['등록', 'ㄱㄷ햔ㅅㄷㄱ', 'emdfhr'],
      description: 'commands.register.DESC',
      group: 'activation',
      requireDB: true
    })

    this._logPos = 'RegisterCommand'
  }

  async run (client, msg, args, locale) {
    const t = client.locale.t

    const isRegistered = await database.users.isRegistered(client.db, msg.author.id)
    if (isRegistered) return msg.reply(t('commands.register.alreadyRegistered', locale))

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

    const botMsg = await msg.channel.send(t('commands.register.title', locale) + '\n\n' +
      t('commands.register.content', locale) + '\n\n' +
      t('commands.register.confirm', locale))

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      msg.channel.send(t('commands.register.reactFail', locale, client.locale.t('perms.ADD_REACTION', locale)))
    }

    const pend = async (c) => {
      if (done) return

      if (c.size > 0 && result) {
        await this.agree(msg, locale)
      } else {
        this.deny(msg, locale)
      }

      done = true
    }

    // Message Collector
    msg.channel.awaitMessages(mcFilter, { time: 15000, max: 1 }).then(pend)

    // Reaction Collector
    botMsg.awaitReactions(rcFilter, { time: 15000, max: 1 }).then(pend)
  }

  async agree (msg, locale) {
    // Activation
    try {
      await database.users.register(this._client.db, {
        id: msg.author.id
      })
    } catch (err) {
      const e = new ClientError(err)
      e.report(msg, locale, this._logPos + '.agree')
    }

    // Done!
    this._client.logger.log('Command / Register', `[User Registration] ${msg.author.tag} (${msg.member.nickname}) has registered to the bot`)
    msg.channel.send(this._client.locale.t('commands.register.agree', locale, this._client.config.prefix))
  }

  deny (msg, locale) {
    msg.channel.send(this._client.locale.t('commands.register.deny', locale))
  }
}

module.exports = RegisterCommand
