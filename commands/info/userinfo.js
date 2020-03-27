/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const Command = require('../../classes/Command')

class UserInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      aliases: ['user-info', '이용자정보', '사용자정보', '유저정보'],
      description: '...'
    })
  }

  async run (client, msg, _args, locale) {
    return msg.channel.send(client.locale.t('commands.userinfo.result:'
    + 'Username: %1$s\nUser ID: %2$s', locale, msg.author.username, msg.author.id))
  }
}

module.exports = UserInfoCommand
