/*
 * @name memo.js
 * @description 저장된 메모를 보여줍니다.
 */

const BotCommand = require('../../utils/BotCommand')

module.exports = class MemoCommand extends BotCommand {
  constructor(client) {
    super(client, {
      name: 'memo',
      aliases: ['메모', 'mm', 'ㅁㅁ'],
      group: 'memo',
      memberName: 'memo',
      description: 'memo list'
    })
  }

  run() {

  }
}
