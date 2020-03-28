const Command = require('../../classes/Command')

class DeactivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deactivate',
      aliases: ['deact', '비활성화'],
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
      await msg.channel.send(client.locale.t('commands.deactivate.reactFail', ocale))
    }

    // Message Collector
    this.author = msg.author.id
    const mc = msg.channel.createMessageCollector(mcFilter)
    mc.on('collect', () => {
      if (this.result) {
        this.agree(msg, mc, rc)
      } else {
        this.deny(msg, mc, rc)
      }
    })

    // Reaction Collector
    const rc = botMsg.createReactionCollector(rcFilter)
    rc.on('collect', () => {
      if (this.result) {
        this.agree(msg, rc, mc)
      } else {
        this.deny(msg, rc, mc)
      }
    })
  }

  async agree (msg, collector, collector2) {
    // Activation
    this._client.logger.log('Command / Deactivate', `[Bot Deactivation] ${msg.author.tag} (${msg.member.nickname}) deactivated the bot in ${msg.guild.name}`)

    await msg.client.provider.set('guilds', msg.guild.id, { activated: false })

    // Done!
    await msg.channel.send(this._client.locale.t('commands.deactivate.agree', locale))
    collector.stop()
    collector2.stop()
  }

  async deny (msg, collector, collector2) {
    await msg.channel.send(this._client.locale.t('commands.deactivate.deny', locale))
    collector.stop()
    collector2.stop()
  }
}

module.exports = DeactivateCommand
