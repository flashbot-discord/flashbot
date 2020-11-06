const Command = require('../../structures/Command')
const ClientError = require('../../structures/ClientError')
const database = require('../../database')

class DeactivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deactivate',
      aliases: ['deact', '비활성화', 'ㅇㄷㅁㅊ샾ㅁㅅㄷ', 'ㅇㄷㅁㅊㅅ', 'qlghkftjdghk'],
      description: 'commands.deactivate.DESC:Deactivate this bot on the server',
      group: 'activation',
      userPerms: ['ADMINISTRATOR'],
      guildOnly: true,
      guildAct: true,
      requireDB: true,
      userReg: true
    })

    this._logPos = 'DeactivateCommand'
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t
    let result; let done = false

    const mcFilter = (m, author) => {
      if (author === m.author.id) {
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

    const botMsg = await msg.channel.send(t('commands.deactivate.title', locale) + '\n\n' +
      t('commands.deactivate.content', locale, client.config.prefix) + '\n\n' +
      t('commands.deactivate.confirm', locale)
    )

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      msg.channel.send(t('commands.deactivate.reactFail', locale, t('perms.ADD_REACTIONS', locale))
      )
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
    msg.channel.awaitMessages((m) => mcFilter(m, msg.author.id), { time: 15000, max: 1 }).then(pend)

    // Reaction Collector
    botMsg.awaitReactions(rcFilter, { time: 15000, max: 1 }).then(pend)
  }

  async agree (msg, locale) {
    // Deactivation
    try {
      await this.dbHandle(this._client.db, msg.guild.id)
    } catch (e) {
      const error = new ClientError(e)
      error.report(msg, locale, this._logPos + '.agree')
    }

    // Done!
    this._client.logger.log('Command / Deactivate', `[Bot Deactivation] ${msg.author.tag} (${msg.member.nickname}) deactivated the bot in ${msg.guild.name}`)
    msg.channel.send(this._client.locale.t('commands.deactivate.agree', locale, this._client.config.prefix))
  }

  deny (msg, locale) {
    msg.channel.send(this._client.locale.t('commands.deactivate.deny', locale))
  }

  async dbHandle (dbHandler, guildID) {
    await database.guilds.setActivation(dbHandler, guildID, false)
  }
}

module.exports = DeactivateCommand
