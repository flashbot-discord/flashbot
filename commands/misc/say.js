/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const Command = require('../../classes/Command')

class SayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      aliases: ['말하기', 'ㄴ묘', 'akfgkrl'],
      description: 'commands.say.DESC:Says back!',
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
    if(query.args.length < 1) return await msg.reply(Command.makeUsage(this, query.cmd, locale))
    return await msg.channel.send(query.args.join(' '))
  }
}

module.exports = SayCommand
