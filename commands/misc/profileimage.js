const Command = require('../../classes/Command')

class ProfileImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'profileimage',
      aliases: ['프사', '프로필사진', 'proimg', 'ㅔ개랴ㅣ댜ㅡㅁㅎㄷ', 'vmtk'],
      description: 'Shows a profile image'
    })
  }

  async run (client, msg, query, locale) {
    if(msg.mentions.users.size > 0) return await msg.channel.send(msg.mentions.users.first().displayAvatarURL())

    if(query.args.length < 1) return await msg.reply(client.locale.t('commands.profileimage.usage:Usage: %1$s%2$s (user: string/@mention)', locale, client.config.prefix, query.cmd))
  }
}

module.exports = ProfileImageCommand
