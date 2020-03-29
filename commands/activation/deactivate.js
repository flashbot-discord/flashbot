const Command = require('../../classes/Command')

class DeactivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deactivate',
      aliases: ['deact', '비활성화', 'ㅇㄷㅁㅊ샾ㅁㅅㄷ', 'ㅇㄷㅁㅊㅅ', 'qlghkftjdghk'],
      description: 'Deactivate this bot on the server',
      userPermissions: ['ADMINISTRATOR'],
      guildOnly: true
    })
  }

  async run (client, msg, args, locale) {
    const mcFilter = (msg) => {
      if (this.author === msg.author.id) {
        if (msg.content.toLowerCase() !== 'yes' && msg.content.toLowerCase() !== 'no') return false
        else if (msg.content.toLowerCase() === 'yes') this.result = true
        else if (msg.content.toLowerCase() === 'no') this.result = false
        return true
      } else return false
    }

    const rcFilter = (reaction, user) => {
      if (user.id === msg.author.id) {
        if (reaction.emoji.name !== '✅' && reaction.emoji.name !== '❌') return false
        else if (reaction.emoji.name === '✅') this.result = true
        else if (reaction.emoji.name === '❌') this.result = false
        return true
      } else return false
    }

    const botMsg = await msg.channel.send(client.locale.t('commands.deactivate.title', locale) + '\n\n' 
      + client.locale.t('commands.deactivate.content', locale) + '\n\n' 
      + client.locale.t('commands.deactivate.confirm', locale))

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      await msg.channel.send(client.locale.t('commands.deactivate.reactFail', locale))
    }

    // Message Collector
    this.author = msg.author.id
    const mc = msg.channel.createMessageCollector(mcFilter)
    mc.on('collect', () => {
      if (this.result) {
        this.agree(msg, locale, mc, rc)
      } else {
        this.deny(msg, locale, mc, rc)
      }
    })

    // Reaction Collector
    const rc = botMsg.createReactionCollector(rcFilter)
    rc.on('collect', () => {
      if (this.result) {
        this.agree(msg, locale, rc, mc)
      } else {
        this.deny(msg, locale, rc, mc)
      }
    })
  }

  async agree (msg, locale, collector, collector2) {
    // Activation
    this._client.logger.log('Command / Deactivate', `[Bot Deactivation] ${msg.author.tag} (${msg.member.nickname}) deactivated the bot in ${msg.guild.name}`)

    // DB
    const db = this._client.db
    switch(db.type) {
      case 'mysql':
        await this.mysqlHandle(msg.guild.id)
        break
      case 'json':
        if(db.obj.guild[msg.guild.id] == null) db.obj.guild[msg.guild.id] = { activated: false }
        else db.obj.guild[msg.guild.id].activated = false
    }

    // Done!
    await msg.channel.send(this._client.locale.t('commands.deactivate.agree', locale))
    collector.stop()
    collector2.stop()
  }

  async deny (msg, locale, collector, collector2) {
    await msg.channel.send(this._client.locale.t('commands.deactivate.deny', locale))
    collector.stop()
    collector2.stop()
  }

  async mysqlHandle(guildID) {
    const db = this._client.db
    const dbData = await db.knex('guild').select('id').where('id', guildID)
    if(dbData.length < 1) await db.knex('guild').insert({       id: guildID,
      locale: 'en_US',                                           activated: false
    })
    else await db.knex('guild').where('id', guildID).update({ activated: false })
  }
}

module.exports = DeactivateCommand
