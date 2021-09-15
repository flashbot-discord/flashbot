const { MessageActionRow, MessageButton } = require('discord.js')

const Command = require('../_Command')
const ClientError = require('../../structures/ClientError')
const database = require('../../database')
const logger = require('../../shared/logger')('cmd:deactivate')
const EMOJIS = require('../../shared/emojis')

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
    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel(t('commands.deactivate.buttons.yes'))
        .setEmoji(EMOJIS.white_check_mark)
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel(t('commands.deactivate.buttons.no'))
        .setEmoji(EMOJIS.x)
        .setStyle('DANGER')
    )

    const botMsg = await msg.reply({
      content: `${t('commands.deactivate.title')}\n\n` +
        t('commands.deactivate.content', client.config.prefix),
      components: [buttonRow]
    })

    const filterFn = (interaction, t) => {
      const { user } = interaction

      if (user.bot || user.id !== msg.author.id) {
        return interaction.reply({
          content: t('commands.deactivate.notExecutor'),
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
    const msg = interaction.message
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
    await interaction.reply(t('commands.deactivate.agree', this._client.config.prefix))
  }

  async deny (interaction, t) {
    await interaction.reply(t('commands.deactivate.deny'))
  }

  async dbHandle (dbHandler, guildID) {
    await database.guilds.setActivation(dbHandler, guildID, false)
  }
}

module.exports = DeactivateCommand
