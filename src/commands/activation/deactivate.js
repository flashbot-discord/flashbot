const Command = require('../_Command')
const ClientError = require('../../structures/ClientError')
const database = require('../../database')
const logger = require('../../shared/logger')('cmd:deactivate')

class DeactivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deactivate',
      aliases: ['deact', '비활성화', 'ㅇㄷㅁㅊ샾ㅁㅅㄷ', 'ㅇㄷㅁㅊㅅ', 'qlghkftjdghk'],
      group: 'activation',
      userPerms: ['ADMINISTRATOR'],
      guildOnly: true,
      guildAct: true,
      requireDB: true,
      userReg: true
    })
  }

  async run (client, msg, query, { t }) {
    let result
    let done = false

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

    const botMsg = await msg.channel.send(t('commands.deactivate.title') + '\n\n' +
      t('commands.deactivate.content', client.config.prefix) + '\n\n' +
      t('commands.deactivate.confirm')
    )

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      msg.channel.send(t('commands.deactivate.reactFail', t('perms.ADD_REACTIONS'))
      )
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
    msg.channel.awaitMessages((m) => mcFilter(m, msg.author.id), { time: 15000, max: 1 }).then(pend)

    // Reaction Collector
    botMsg.awaitReactions(rcFilter, { time: 15000, max: 1 }).then(pend)
  }

  async agree (msg, t) {
    const loggerFn = logger.extend('agree')

    // Deactivation
    try {
      await this.dbHandle(this._client.db, msg.guild.id)
    } catch (e) {
      const error = new ClientError(e)
      error.report(msg, t, 'cmd:deactivate.agree')
    }

    // Done!
    loggerFn.log(`[Server Deactivation] ${msg.author.tag} (${msg.member.nickname}) deactivated the bot in ${msg.guild.name}`)
    msg.channel.send(t('commands.deactivate.agree', this._client.config.prefix))
  }

  deny (msg, t) {
    msg.channel.send(t('commands.deactivate.deny'))
  }

  async dbHandle (dbHandler, guildID) {
    await database.guilds.setActivation(dbHandler, guildID, false)
  }
}

module.exports = DeactivateCommand
