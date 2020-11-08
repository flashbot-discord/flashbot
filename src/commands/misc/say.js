/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const { MessageMentions, MessageEmbed } = require('discord.js')
const Command = require('../../structures/Command')

class SayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      aliases: ['말하기', 'ㄴ묘', 'akfgkrl'],
      description: 'commands.say.DESC:Says back!',
      group: 'misc',
      args: [
        {
          name: 'commands.say.args.text.NAME:text',
          description: 'commands.say.args.text.DESC:Text to say.',
          type: 'common.string:string'
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    if (query.args.length < 1) return await msg.reply(Command.makeUsage(this, query.cmd, t))

    const str = query.args.join(' ')

    // Reset the pattern count
    MessageMentions.EVERYONE_PATTERN.lastIndex = 0
    if (MessageMentions.EVERYONE_PATTERN.test(str)) return await msg.reply(t('commands.say.noEveryone'))

    const say = query.args.join(' ')
    if (
      client.config.owner.includes(msg.author.id) ||
      msg.member.permissions.has('ADMINISTRATOR')
    ) msg.channel.send(say)
    else {
      if (msg.channel.permissionsFor(client.user).has('EMBED_LINKS')) {
        const embed = new MessageEmbed()
          .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
          .setFooter(t('commands.say.embedFooter'))
          .setDescription(say)
        msg.channel.send(embed)
      } else msg.channel.send(t('commands.say.say', say, msg.author.tag))
    }
  }
}

module.exports = SayCommand
