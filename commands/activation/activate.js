const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')

class ActivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'activate',
      aliases: ['act', '활성화', 'ㅁㅊ샾ㅁㅅㄷ', 'ㅁㅊㅅ', 'ghkftjdghk'],
      description: 'commands.activate.DESC:Activate this bot on the server',
      group: 'activation',
      userPerms: ['ADMINISTRATOR'],
      guildOnly: true
    })
  }

  async run (client, msg, args, locale) {
    const t = client.locale.t
    let result, done = false

    const mcFilter = (msg, author) => {
      if (author === msg.author.id) {
        if (msg.content.toLowerCase() !== 'yes' && msg.content.toLowerCase() !== 'no') return false
        else if (msg.content.toLowerCase() === 'yes') result = true
        else if (msg.content.toLowerCase() === 'no') result = false
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

    const botMsg = await msg.channel.send(t('commands.activate.title', locale) + '\n\n' +
      t('commands.activate.content', locale) + '\n\n' +
      t('commands.activate.confirm', locale))

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      await msg.channel.send(t('commands.activate.reactFail:' +
      'The Bot does not have `%1$s` permission, so the bot could not add reaction.\n' +
      'Please enter response via text, or add reaction manually.', locale, client.locale.t('perms.ADD_REACTION:Add Reaction')))
    }

    const pend = (c) => {
      if(done) return

      if (c.size > 0 && result) {
        this.agree(msg, locale)
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
    // Activation

    // DB
    const db = this._client.db
    switch (db.type) {
      case 'mysql':
      case 'pg':
        await this.dbHandle(msg, locale)
        break

      case 'json':
        if (db.obj.guild[msg.guild.id] == null) db.obj.guild[msg.guild.id] = { activated: true }
        else db.obj.guild[msg.guild.id].activated = true
    }

    // Done!
    this._client.logger.log('Command / Activate', `[Bot Activation] ${msg.author.tag} (${msg.member.nickname}) activated the bot in ${msg.guild.name}`)
    await msg.channel.send(this._client.locale.t('commands.activate.agree', locale))
  }

  async deny (msg, locale) {
    await msg.channel.send(this._client.locale.t('commands.activate.deny', locale))
  }

  async dbHandle (msg, locale) {
    const db = msg.client.db
    const guildID = msg.guild.id
    try {
      const dbData = await db.knex('guilds').select('id').where('id', guildID)
      if (dbData.length < 1) {
        await db.knex('guilds').insert({
          id: guildID,
          locale: 'en_US',
          activated: true
        })
      } else await db.knex('guilds').where('id', guildID).update({ activated: true })
    } catch (err) {
      throw new ClientError('Cannot connect to the database. Please wait a few minutes and try again.').report(msg, locale)
    }
  }
}

module.exports = ActivateCommand
