/**
 * @name args-info.js
 * @description 입력된 인수를 체크하는 명령어입니다.
 */
const Command = require('../../classes/Command')

class ArgsInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'args-info',
      aliases: ['argsinfo'],
      description: ''
    })
  }

  async run (client, msg, args, locale) {
    if (args.args.length < 1) {
      return msg.reply(client.locale.t('commands.args-info.noArgs:No arguments provided.', locale))
    }

    return await msg.channel.send(client.locale.t('commands.args-info.result:'
      + 'Command name: %1$s\nArguments: %2$s', args.cmd, args.args.join(' ')))
  }
}

module.exports = ArgsInfoCommand
