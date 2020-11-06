const { MessageEmbed } = require('discord.js')

const Command = require('../../structures/Command')
const canSendEmbed = require('../../modules/canSendEmbed')
const getPrefix = require('../../modules/getPrefix')

class HelloCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hello',
      description: 'commands.hello.DESC',
      aliases: ['안녕', 'ㅎㅇ', 'hi',
        'ㅗ디ㅣㅐ', 'dkssud', 'gd', 'ㅗㅑ'],
      group: 'misc'
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t
    const useEmbed = canSendEmbed(client.user, msg.channel)

    const prefix = await getPrefix(client, msg.guild ? msg.guild.id : null)
    let prefixStr = ''
    if (msg.guild) prefixStr = t('commands.hello.prefix.guild', locale, prefix)
    else prefixStr = t('commands.hello.prefix.dm', locale)

    if (useEmbed) {
      const embed = new MessageEmbed()
        .setTitle(':wave: ' + t('commands.hello.title', locale))
        .setDescription(t('commands.hello.description', locale, prefixStr, prefix))

      msg.channel.send(embed)
    } else {
      const str = `:wave: ${t('commands.hello.title', locale)}\n` +
        t('commands.title.description', locale, prefixStr, prefix)
      msg.channel.send(str)
    }
  }
}

module.exports = HelloCommand
