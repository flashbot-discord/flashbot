const { MessageActionRow, MessageButton } = require('discord.js')

const Command = require('../_Command')
const ClientError = require('../../structures/ClientError')
const database = require('../../database')
const logger = require('../../shared/logger')('cmd:activate')
const EMOJIS = require('../../shared/emojis')

class ActivateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'activate',
      aliases: ['act', '활성화', 'ㅁㅊ샾ㅁㅅㄷ', 'ㅁㅊㅅ', 'ghkftjdghk'],
      group: 'activation',
      userPerms: ['ADMINISTRATOR'],
      guildOnly: true,
      requireDB: true,
      userReg: true
    })
  }

  async run (client, msg, query, { t }) {
    const isActivated = await database.guilds.isActivated(client.db, msg.guild.id)
    if (isActivated) return msg.reply(t('commands.activate.alreadyActivated'))

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel(t('commands.activate.buttons.yes'))
        .setEmoji(EMOJIS.white_check_mark)
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel(t('commands.activate.buttons.no'))
        .setEmoji(EMOJIS.x)
        .setStyle('DANGER')
    )

    const botMsg = await msg.reply({
      content: `${t('commands.activate.title')}\n\n` +
        t('commands.activate.content'),
      components: [buttonRow]
    })

    const filterFn = (interaction, t) => {
      const { user } = interaction

      if (user.bot || user.id !== msg.author.id) {
        return interaction.reply({
          content: t('commands.activate.notExecutor'),
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

    // Activation
    try {
      await this.dbHandle(this._client.db, msg.guild.id)
    } catch (e) {
      const error = new ClientError(e)
      error.report(msg, t, 'cmd:activate.agree')
    }

    // Done!
    loggerFn.log(`[Server Activation] ${msg.author.tag} (${msg.member.nickname}) activated the bot in ${msg.guild.name}`)
    await interaction.reply(t('commands.activate.agree'))
  }

  async deny (interaction, t) {
    await interaction.reply(t('commands.activate.deny'))
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
