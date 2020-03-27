const Command = require('../../classes/Command')

class ProfileImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'profileimage',
      aliases: ['프사', '프로필사진', 'proimg'],
      description: 'Shows a profile image'
    })
  }

  run (msg, args) {
    msg.channel.send(args.user.displayAvatarURL)
  }
}

module.exports = ProfileImageCommand
