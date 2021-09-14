const { MessageButton } = require('discord.js')
const { MessageEmbed, MessageActionRow } = require('discord.js')

const EMOJIS = require('../shared/emojis')

class Paginator {
  constructor (client, msg, options) {
    this._client = client
    this.msg = msg
    this.contents = options.contents || ['']
    this.timeout = options.timeout || 60000 // 1 minute
    this.ctrlUser = options.userID || ''
    this.page = 0
    this.keepRun = true
    this.messageOptions = options.messageOptions || {}

    this.buttonActions = new Map([
      ['first', EMOJIS.track_previous],
      ['prev', EMOJIS.arrow_backward],
      ['stop', EMOJIS.stop_button],
      ['next', EMOJIS.arrow_forward],
      ['last', EMOJIS.track_next]
    ])
  }

  validateUser (interaction) {
    const { user } = interaction

    if (user.bot || user.id !== this.ctrlUser) return false
    return true
  }

  async start () {
    const buttons = []
    for (const id of this.buttonActions.keys()) {
      const btn = new MessageButton()
        .setCustomId(id)
        .setLabel(this.buttonActions.get(id))
        .setStyle('PRIMARY')
      buttons.push(btn)
    }
    const buttonRow = new MessageActionRow()
    buttonRow.addComponents(...buttons)

    this.buttonRow = buttonRow

    // send message on start only. after that use button interaction.
    if (this.contents[this.page] instanceof MessageEmbed) {
      await this.msg.edit({
        ...this.messageOptions,
        content: '\u200b',
        embeds: [this.contents[this.page]],
        components: [buttonRow]
      })
    } else {
      await this.msg.edit({
        ...this.messageOptions,
        content: this.contents[this.page],
        components: [buttonRow]
      })
    }

    let interaction
    while (this.keepRun) {
      try {
        console.log('before collect')
        interaction = await this.msg.awaitMessageComponent({
          time: this.timeout
        })
        console.log('after collect')
      } catch (e) {
        return console.error(e)
      }

      if (!this.validateUser(interaction)) {
        await interaction.reply({ content: 'asdf', ephemeral: true })
        continue
      }

      if (interaction) await this.run(interaction)
      else this.keepRun = false
    }

    this.stop(interaction)
  }

  async run (interaction) {
    switch (interaction.customId) {
      case 'first':
        if (this.page > 0) {
          this.page = 0
        }

        await this.update(interaction)
        break

      case 'prev':
        if (this.page >= 1) this.page--
        await this.update(interaction)
        break

      case 'stop':
        this.keepRun = false // this.stop() will handle interaction updates
        return

      case 'next':
        if (this.page < this.contents.length - 1) this.page++
        await this.update(interaction)
        break

      case 'last':
        if (this.page < this.contents.length - 1) {
          this.page = this.contents.length - 1
        }

        await this.update(interaction)
    }
  }

  // triggiered via button
  async update (interaction) {
    if (this.contents[this.page] instanceof MessageEmbed) {
      await interaction.update({
        ...this.messageOptions,
        embeds: [this.contents[this.page]]
      })
    } else {
      await interaction.update({
        ...this.messageOptions,
        content: this.contents[this.page]
      })
    }
  }

  async stop (interaction) {
    this.keepRun = false

    if (this.contents[this.page] instanceof MessageEmbed) {
      await interaction.update({
        ...this.messageOptions,
        components: []
      })
    } else {
      await interaction.update({
        ...this.messageOptions,
        components: []
      })
    }
  }
}

module.exports = Paginator
