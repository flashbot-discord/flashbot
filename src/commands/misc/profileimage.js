const Command = require('../_Command')

class ProfileImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'profileimage',
      aliases: ['프사', '프로필사진', 'proimg', 'ㅔ개랴ㅣ댜ㅡㅁㅎㄷ', 'vmtk', 'vmfhvmftkwls', 'ㅔ개ㅑㅡㅎ'],
      description: 'commands.profileimage.DESC:Shows a profile image',
      group: 'misc',
      args: [
        {
          key: 'user',
          description: 'commands.profileimage.args.member.DESC:The member to see the profile image. Currently, only mentions are accepted.',
          type: 'user',
          optional: true
        }
      ]
    })
  }

  // TODO: needs args fix (user: both mention or ids)

  async run (client, msg, query, { t }) {
    const user = query.args.user || msg.author
    await msg.channel.send(user.displayAvatarURL({ dynamic: true, size: 1024 }))
  }
}

module.exports = ProfileImageCommand
