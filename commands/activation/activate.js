const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')

class ActivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'activate',
      aliases: ['act', '활성화', 'ㅁㅊ샾ㅁㅅㄷ', 'ㅁㅊㅅ', 'ghkftjdghk'],
      description: 'commands.activate.DESC:Activate this bot on the server',
      userPermissions: ['ADMINISTRATOR'],
      guildOnly: true
    })

    this.result = false
    this.author = ''
  }

  async run (client, msg, args, locale) {
    let result

    const mcFilter = (msg, author) => {
      if (this.author === msg.author.id) {
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

    const botMsg = await msg.channel.send(client.locale.t('commands.activate.title:Activate **Flashbot**', locale) + '\n\n'
      + client.locale.t('commands.activate.content:'
        + "You need to agree to the FlashBot's **Terms of Service** and **Privacy Policy**.\n"
        + 'You can see them in the link below.\n'
        + 'Terms of Service: https://flashbot.ga/tos\n'
        + 'Privacy Policy: https://flashbot.ga/privacy', locale) + '\n\n' 
      + client.locale.t('commands.activate.confirm:'
    + 'React with :white_check_mark: or type `Yes` to agree, otherwise react with :x: or type `No` to deny.', locale))

    try {
      await botMsg.react('✅')
      await botMsg.react('❌')
    } catch (err) {
      await msg.channel.send(client.locale.t('commands.activate.reactFail:'
      + 'The Bot does not have `%1$s` permission, so the bot could not add reaction.\n'
      + 'Please enter response via text, or add reaction manually.', locale, client.locale.t('perms.ADD_REACTION:Add Reaction')))
    }

    const pend = () => {
      if (result) {
        this.agree(msg, locale, mc, rc)
      } else {
        this.deny(msg, locale, mc, rc)
      }
    }
    const end = () => {if(result == null) pend()}

    // Message Collector
    const mc = msg.channel.createMessageCollector((m) => mcFilter(m, msg.author.id), { time: 15000 })
    mc.on('collect', pend)
    mc.on('end', end)

    // Reaction Collector
    const rc = botMsg.createReactionCollector(rcFilter, { time:15000 })
    rc.on('collect', pend)
  }

  async agree (msg, locale, collector, collector2) {
    // Activation

    // DB
    try{
    const db = this._client.db
    switch(db.type) {
      case 'mysql':
        await this.mysqlHandle(msg, locale)
        break

      case 'json':
        if(db.obj.guild[msg.guild.id] == null) db.obj.guild[msg.guild.id] = { activated: true }
        else db.obj.guild[msg.guild.id].activated = true
    }

    // Done!
    this._client.logger.log('Command / Activate', `[Bot Activation] ${msg.author.tag} (${msg.member.nickname}) activated the bot in ${msg.guild.name}`)
    await msg.channel.send(this._client.locale.t('commands.activate.agree:'
    + "Thank you! You agreed with our Terms of Service and Privacy Policy. The Bot is now activated on this server. You (and this server's member) can use this bot right now!", locale))
    }catch(err){throw err}
    finally{
    collector.stop()
    collector2.stop()
    }
  }

  async deny (msg, locale, collector, collector2) {
    await msg.channel.send(this._client.locale.t('commands.activate.deny:Bot Activation cancelled.', locale))
    collector.stop()
    collector2.stop()
  }

  async mysqlHandle(msg, locale) {
    const db = msg.client.db
    const guildID = msg.guild.id
    try{ 
      const dbData = await db.knex('guild').select('id').where('id', guildID)
      if(dbData.length < 1) await db.knex('guild').insert({
        id: guildID,
        locale: 'en_US',
        activated: true
      })
      else await db.knex('guild').where('id', guildID).update({ activated: true })
    } catch(err) {
      throw new ClientError('Cannot connect to the database. Please wait a few minutes and try again.').report(msg, locale)
    }
  }
}

module.exports = ActivateCommand
