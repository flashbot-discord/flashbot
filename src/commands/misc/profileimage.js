const Command = require('../_Command')

class ProfileImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'profileimage',
      aliases: ['프사', '프로필사진', 'proimg', 'ㅔ개랴ㅣ댜ㅡㅁㅎㄷ', 'vmtk', 'vmfhvmftkwls', 'ㅔ개ㅑㅡㅎ'],
      group: 'misc',
      args: [
        {
          key: 'user',
          type: 'user',
          optional: true
        }
      ]
    })
  }

  // TODO: needs args fix (user: both mention or ids)

  async run (client, msg, query, { t }) {
    const user = query.args.user || msg.author
    await msg.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }))
  }
}

module.exports = ProfileImageCommand
