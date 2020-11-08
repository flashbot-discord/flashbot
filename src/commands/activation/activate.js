const Command = require('../../structures/Command')
const ClientError = require('../../structures/ClientError')
const database = require('../../database')

class ActivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'activate',
      aliases: ['act', '활성화', 'ㅁㅊ샾ㅁㅅㄷ', 'ㅁㅊㅅ', 'ghkftjdghk'],
      description: 'commands.activate.DESC:Activate this bot on the server',
      group: 'activation',
      userPerms: ['ADMINISTRATOR'],
      guildOnly: true,
      requireDB: true,
      userReg: true
    })

    this._logPos = 'ActivateCommand'
  }

  async run (client, msg, query, { t }) {
    const isActivated = await database.guilds.isActivated(client.db, msg.guild.id)
    if (isActivated) return msg.reply(t('commands.activate.alreadyActivated'))

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

    const botMsg = await msg.channel.send(t('commands.activate.title') + '\n\n' +
      t('commands.activate.content') + '\n\n' +
      t('commands.activate.confirm')
    )

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      msg.channel.send(t('commands.activate.reactFail', client.locale.t('perms.ADD_REACTIONS')))
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
    // Activation
    try {
      await this.dbHandle(this._client.db, msg.guild.id)
    } catch (e) {
      const error = new ClientError(e)
      error.report(msg, t, this._logPos + '.agree')
    }

    // Done!
    this._client.logger.log('Command / Activate', `[Bot Activation] ${msg.author.tag} (${msg.member.nickname}) activated the bot in ${msg.guild.name}`)
    msg.channel.send(t('commands.activate.agree'))
  }

  deny (msg, t) {
    msg.channel.send(t('commands.activate.deny'))
  }

  async dbHandle (dbHandler, guildID) {
    if (await database.guilds.isRegistered(dbHandler, guildID)) await database.guilds.setActivation(dbHandler, guildID, true)
    else {
      await database.guilds.register(dbHandler, {
        id: guildID,
        activated: true
      })
    }
  }
}

module.exports = ActivateCommand
