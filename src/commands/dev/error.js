const Command = require('../_Command')

class ErrorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'error',
      aliases: ['에러', 'ㄷㄱㄱ객', 'dpfj'],
      description: 'commands.error.DESC',
      group: 'dev',
      ownerOnly: true
    })
  }

  run (_client, _msg, _query, _) {
    throw new Error('예상한 오류가 발생했습니다\n```~~계획대로야~~```\u200b')
  }
}

module.exports = ErrorCommand
