const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')

class DeactivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deactivate',
      aliases: ['deact', '비활성화', 'ㅇㄷㅁㅊ샾ㅁㅅㄷ', 'ㅇㄷㅁㅊㅅ', 'qlghkftjdghk'],
      description: 'commands.deactivate.DESC:Deactivate this bot on the server',
      userPerms: ['ADMINISTRATOR'],
      guildOnly: true
    })
  }

  async run (client, msg, args, locale) {
    if (!await client.db.isRegisteredGuild(msg.guild.id)) return Command.pleaseRegisterGuild(this, msg, locale)

    let result

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

    const botMsg = await msg.channel.send(client.locale.t('commands.deactivate.title:Deactivate **FlashBot**', locale) + '\n\n' +
      client.locale.t('commands.deactivate.content:' +
        "You're now going to disable **FlashBot** on this server.\n" +
        'When deactivated, the bot will not respond any commands except `activate`.\n' +
        'The data for this server will be stored after you deactivated the bot.', locale) + '\n\n' +
      client.locale.t('commands.deactivate.confirm:' +
    'React with :white_check_mark: or type `Yes` to confirm deactivation, otherwise react with :x: or type `No` to cancel.', locale))

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      await msg.channel.send(client.locale.t('commands.deactivate.reactFail:' +
        'The Bot does not have `%1$s` permission, so the bot could not add reaction.\n' +
        'Please enter response via text, or add reaction manually', locale, client.locale.t('perms.ADD_REACTION:Add Reaction')))
    }

    const pend = () => {
      if (result) {
        this.agree(msg, locale, mc, rc)
      } else {
        this.deny(msg, locale, mc, rc)
      }
    }
    const end = () => { if (result == null) pend() }

    // Message Collector
    const mc = msg.channel.createMessageCollector((m) => mcFilter(m, msg.author.id), { time: 15000 })
    mc.on('collect', pend)
    mc.on('end', end)

    // Reaction Collector
    const rc = botMsg.createReactionCollector(rcFilter, { time: 15000 })
    rc.on('collect', pend)
  }

  async agree (msg, locale, collector, collector2) {
    // Deactivation

    // DB
    const db = this._client.db
    switch (db.type) {
      case 'mysql':
        await this.mysqlHandle(msg, locale)
        break
      case 'json':
        if (db.obj.guild[msg.guild.id] == null) db.obj.guild[msg.guild.id] = { activated: false }
        else db.obj.guild[msg.guild.id].activated = false
    }

    // Done!
    this._client.logger.log('Command / Deactivate', `[Bot Deactivation] ${msg.author.tag} (${msg.member.nickname}) deactivated the bot in ${msg.guild.name}`)
    await msg.channel.send(this._client.locale.t('commands.deactivate.agree:' +
    'Thank you for using our bot. The bot is now disabled in this server. To reactivate, use the `activate` command.', locale))
    collector.stop()
    collector2.stop()
  }

  async deny (msg, locale, collector, collector2) {
    await msg.channel.send(this._client.locale.t('commands.deactivate.deny:Bot deactivation cancelled.', locale))
    collector.stop()
    collector2.stop()
  }

  async mysqlHandle (msg, locale) {
    const db = msg.client.db
    const guildID = msg.guild.id

    try {
      const dbData = await db.knex('guild').select('id').where('id', guildID)
      if (dbData.length < 1) {
        await db.knex('guild').insert({
          id: guildID,
          locale: 'en_US',
          activated: false
        })
      } else await db.knex('guild').where('id', guildID).update({ activated: false })
    } catch (err) {
      throw new ClientError('Cannot connect to the database. Please wait a few minutes and try again.').report(msg, locale)
    }
  }
}

module.exports = DeactivateCommand
