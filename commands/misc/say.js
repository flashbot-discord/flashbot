/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const i18n = require('i18n')

const Command = require('../../classes/Command')

class SayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      aliases: ['말하기'],
      description: 'Replies with a meow, kitty cat.'
    })
  }

  run (msg, { input }) {
    if (!super.run(msg)) return

    return msg.channel.send(input)
  }
}

module.exports = SayCommand
