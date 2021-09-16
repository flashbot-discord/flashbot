const { MessageActionRow, MessageButton } = require('discord.js')

const Command = require('../_Command')
const ClientError = require('../../structures/ClientError')
const database = require('../../database')
const logger = require('../../shared/logger')('cmd:register')
const EMOJIS = require('../../shared/emojis')

class RegisterCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'register',
      aliases: ['등록', '가입', 'ㄱㄷ햔ㅅㄷㄱ', 'emdfhr', 'rkdlq'],
      group: 'activation',
      requireDB: true
    })
  }

  async run (client, msg, args, { t }) {
    const isRegistered = await database.users.isRegistered(client.db, msg.author.id)
    if (isRegistered) return msg.reply(t('commands.register.alreadyRegistered'))

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel(t('commands.register.buttons.yes'))
        .setEmoji(EMOJIS.white_check_mark)
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel(t('commands.register.buttons.no'))
        .setEmoji(EMOJIS.x)
        .setStyle('DANGER')
    )

    const botMsg = await msg.reply({
      content: `${t('commands.register.title')}\n\n` +
        t('commands.register.content'),
      components: [buttonRow]
    })

    const filterFn = (interaction, t) => {
      const { user } = interaction

      if (user.bot || user.id !== msg.author.id) {
        return interaction.reply({
          content: t('commands.register.notExecutor'),
          ephemeral: true
        })
      }
      return true
    }

    let interaction
    try {
      interaction = await botMsg.awaitMessageComponent({
        filter: (i) => filterFn(i, t),
        time: 30000
      })
    } catch {}

    await botMsg.edit({
      components: []
    })
    if (!interaction) return

    switch (interaction.customId) {
      case 'yes': {
        await this.agree(interaction, t)
        break
      }

      case 'no': {
        await this.deny(interaction, t)
        break
      }
    }
  }

  async agree (interaction, t) {
    const { user, member } = interaction
    const loggerFn = logger.extend('agree')

    // Activation
    try {
      await database.users.register(this._client.db, {
        id: user.id
      })
    } catch (err) {
      const e = new ClientError(err)
      // TODO: interaction.message user field is bot, needs to change
      e.report(interaction.message, t, 'cmd:register.agree')
    }

    // Done!
    loggerFn.log(`[User Registration] ${user.tag} (${member?.nickname}) has been registered`)
    await interaction.reply(t('commands.register.agree', this._client.config.prefix))
  }

  async deny (interaction, t) {
    await interaction.reply(t('commands.register.deny'))
  }
}

module.exports = RegisterCommand
