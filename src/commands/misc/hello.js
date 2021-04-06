const { MessageEmbed } = require('discord.js')

const Command = require('../_Command')
const canSendEmbed = require('../../modules/canSendEmbed')
const getPrefix = require('../../modules/getPrefix')

class HelloCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hello',
      aliases: ['안녕', 'ㅎㅇ', 'hi',
        'ㅗ디ㅣㅐ', 'dkssud', 'gd', 'ㅗㅑ'],
      group: 'misc'
    })
  }

  async run (client, msg, query, { t }) {
    const useEmbed = canSendEmbed(client.user, msg.channel)

    const prefix = await getPrefix(client, msg.guild ? msg.guild.id : null)
    let prefixStr = ''
    if (msg.guild) prefixStr = t('commands.hello.prefix.guild', prefix)
    else prefixStr = t('commands.hello.prefix.dm')

    if (useEmbed) {
      const embed = new MessageEmbed()
        .setTitle(':wave: ' + t('commands.hello.title'))
        .setDescription(t('commands.hello.description', prefixStr, prefix))

      msg.channel.send(embed)
    } else {
      const str = `:wave: ${t('commands.hello.title')}\n` +
        t('commands.title.description', prefixStr, prefix)
      msg.channel.send(str)
    }
  }
}

module.exports = HelloCommand
