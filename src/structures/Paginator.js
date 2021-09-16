const { MessageButton, MessageEmbed, MessageActionRow } = require('discord.js')

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

  generateMessageComponent () {
    const firstBtn = new MessageButton()
      .setCustomId('first')
      .setLabel('1')
      .setEmoji(EMOJIS.track_previous)
      .setStyle('SECONDARY')
    const previousBtn = new MessageButton()
      .setCustomId('prev')
      .setEmoji(EMOJIS.arrow_backward)
      .setStyle('SECONDARY')
    const stopBtn = new MessageButton()
      .setCustomId('stop')
      .setLabel(`${this.page + 1}`)
      .setEmoji(EMOJIS.stop_button)
      .setStyle('DANGER')
    const nextBtn = new MessageButton()
      .setCustomId('next')
      .setEmoji(EMOJIS.arrow_forward)
      .setStyle('SECONDARY')
    const lastBtn = new MessageButton()
      .setCustomId('last')
      .setLabel(`${this.contents.length}`)
      .setEmoji(EMOJIS.track_next)
      .setStyle('SECONDARY')

    if (this.page === 0) firstBtn.setDisabled(true)
    if (this.page === this.contents.length - 1) lastBtn.setDisabled(true)

    const row = new MessageActionRow().addComponents(
      firstBtn,
      previousBtn,
      stopBtn,
      nextBtn,
      lastBtn
    )
    return row
  }

  async start () {
    const components = this.generateMessageComponent()

    // send message on start only. after that use button interaction.
    if (this.contents[this.page] instanceof MessageEmbed) {
      await this.msg.edit({
        ...this.messageOptions,
        content: '\u200b',
        embeds: [this.contents[this.page]],
        components: [components]
      })
    } else {
      await this.msg.edit({
        ...this.messageOptions,
        content: this.contents[this.page],
        components: [components]
      })
    }

    let interaction
    while (this.keepRun) {
      try {
        interaction = await this.msg.awaitMessageComponent({
          time: this.timeout
        })
      } catch {
        break
      }

      if (!this.validateUser(interaction)) {
        await interaction.reply({ content: 'asdf', ephemeral: true })
        continue
      }

      if (interaction) await this.run(interaction)
      else this.keepRun = false
    }

    this.stop(this.msg)
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
    const newComponents = this.generateMessageComponent()

    if (this.contents[this.page] instanceof MessageEmbed) {
      await interaction.update({
        ...this.messageOptions,
        embeds: [this.contents[this.page]],
        components: [newComponents]
      })
    } else {
      await interaction.update({
        ...this.messageOptions,
        content: this.contents[this.page],
        components: [newComponents]
      })
    }
  }

  async stop (botMsg) {
    this.keepRun = false

    await botMsg.edit({
      ...this.messageOptions,
      components: []
    })
  }
}

module.exports = Paginator
