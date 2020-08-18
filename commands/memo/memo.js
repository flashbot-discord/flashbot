/*
 * @name memo.js
 * @description 저장된 메모를 보여줍니다.
 */

const Command = require('../../classes/Command')

class MemoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'memo',
      aliases: ['메모', 'mm', 'ㅁㅁ', 'ㅡ드ㅐ', 'apah'],
      description: 'memo list',
      group: 'memo'
    })
  }

  run () {

  }
}

module.exports = MemoCommand
