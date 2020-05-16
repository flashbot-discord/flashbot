/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const { MessageMentions } = require('discord.js')
const Command = require('../../classes/Command')

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

  async run (client, msg, query, locale) {
    const t = client.locale.t
    if (query.args.length < 1) return await msg.reply(Command.makeUsage(this, query.cmd, locale))

    const str = query.args.join(' ')

    // Reset the pattern count
    MessageMentions.EVERYONE_PATTERN.lastIndex = 0
    if(MessageMentions.EVERYONE_PATTERN.test(str)) return await msg.reply(t('commands.say.noEveryone', locale))
    return await msg.channel.send(query.args.join(' '))
  }
}

module.exports = SayCommand
