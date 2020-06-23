const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')

class RegisterCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'register',
      aliases: ['등록', 'ㄱㄷ햔ㅅㄷㄱ', 'emdfhr'],
      description: 'commands.register.DESC',
      group: 'activation',
      requireDB: true
    })
  }

  async run (client, msg, args, locale) {
    const t = client.locale.t
    let result; let done = false

    const mcFilter = (m) => {
      if (m.author.id === msg.author.id) {
        if (m.content.toLowerCase() !== 'yes' && m.content.toLowerCase() !== 'no') return false
        else if (m.content.toLowerCase() === 'yes') result = true
        else if (m.content.toLowerCase() === 'no') result = false
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
      await msg.channel.send(t('commands.register.reactFail', locale, client.locale.t('perms.ADD_REACTION', locale)))
    }

    const pend = (c) => {
      if (done) return

      if (c.size > 0 && result) {
        this.agree(msg, locale)
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

    // DB
    const db = this._client.db
    switch (db.type) {
      case 'mysql':
      case 'pg':
        await this.dbHandle(msg, locale)
        break

      case 'json':
        db.obj.user[msg.author.id] = {}
    }

    // Done!
    this._client.logger.log('Command / Register', `[User Registration] ${msg.author.tag} (${msg.member.nickname}) activated the bot in ${msg.guild.name}`)
    await msg.channel.send(this._client.locale.t('commands.register.agree', locale))
  }

  async deny (msg, locale) {
    await msg.channel.send(this._client.locale.t('commands.register.deny', locale))
  }

  async dbHandle (msg, locale) {
    const db = msg.client.db
    const userID = msg.author.id
    try {
      const dbData = await db.knex('users').select('id').where('id', userID)
      if (dbData.length < 1) {
        await db.knex('users').insert({
          id: userID
        })
      }
    } catch (err) {
      const e = new ClientError(err)
      e.report(msg, locale)
      throw e
    }
  }
}

module.exports = RegisterCommand
