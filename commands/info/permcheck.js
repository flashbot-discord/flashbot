const { MessageEmbed, Collection } = require('discord.js')

const Command = require('../../classes/Command')

class PermissionCheckCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'permcheck',
      aliases: ['perm', 'perms', 'permission', 'permissions', '권한확인', '권한', 'ㅔㄷ그', 'ㅔㄷ근', 'ㅔㄷ그ㅑㄴ냐ㅐㅜ', 'ㅔㄷ그ㅑㄴ냐ㅐㅜㄴ', 'rnjsgksghkrdls', 'rnjsgks'],
      description: 'commands.permcheck.DESC',
      group: 'info'
    })
  }

  async run (client, msg, _query, locale) {
    const t = client.locale.t

    const useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    const targetUser = msg.mentions.members.size > 0 ? msg.mentions.members.first() : msg.member
    const serverPerms = targetUser.permissions
    const channelPerms = msg.channel.permissionsFor(targetUser)

    let output
    if (useEmbed) {
      const embed = new MessageEmbed()
        .setAuthor(targetUser.user.tag, targetUser.user.avatarURL())
        .setTitle(t('commands.permcheck.title', locale))

      let isAdmin = false
      if (targetUser.id === msg.guild.owner.id) {
        embed.setDescription(t('commands.permcheck.isOwner', locale))
        isAdmin = true
      } else if (targetUser.permissions.has('ADMINISTRATOR')) {
        embed.setDescription(t('commands.permcheck.isAdmin', locale))
        isAdmin = true
      }

      const permList = new Collection([
        ['ADMINISTRATOR', { channelPerms: null }],
        ['VIEW_AUDIT_LOG', { channelPerms: null }],
        ['MANAGE_GUILD', { channelPerms: null }],
        ['MANAGE_ROLES', { channelPerms: 'both' }],
        ['MANAGE_CHANNELS', { channelPerms: 'both' }],
        ['KICK_MEMBERS', { channelPerms: null }],
        ['BAN_MEMBERS', { channelPerms: null }],
        ['CREATE_INSTANT_INVITE', { channelPerms: 'both' }],
        ['CHANGE_NICKNAME', { channelPerms: null }],
        ['MANAGE_NICKNAMES', { channelPerms: null }],
        ['MANAGE_EMOJIS', { channelPerms: null }],
        ['MANAGE_WEBHOOKS', { channelPerms: 'text' }],
        ['VIEW_CHANNEL', { channelPerms: 'both' }],
        ['SEND_MESSAGES', { channelPerms: 'text' }],
        ['SEND_TTS_MESSAGES', { channelPerms: 'text' }],
        ['MANAGE_MESSAGES', { channelPerms: 'text' }],
        ['EMBED_LINKS', { channelPerms: 'text' }],
        ['ATTACH_FILES', { channelPerms: 'text' }],
        ['READ_MESSAGE_HISTORY', { channelPerms: 'text' }],
        ['MENTION_EVERYONE', { channelPerms: 'text' }],
        ['USE_EXTERNAL_EMOJIS', { channelPerms: 'text' }],
        ['ADD_REACTIONS', { channelPerms: 'text' }]
      ])

      permList.forEach((obj, perm) => {
        embed.addField(t(`perms.${perm}`, locale), makePermsMsg({
          granted: serverPerms.has(perm),
          grantedInChannel: obj.channelPerms != null ? channelPerms.has(perm) : null
        }, t, locale))
      })

      output = embed
    } else {

    }

    msg.channel.send(output)
  }
}

function makePermsMsg (opts, t, locale) {
  const { granted, grantedInChannel } = opts
  const isAdmin = opts.admin || false
  let msg = ''

  const channelPermAvailable = typeof grantedInChannel === 'boolean'

  msg += (granted ? ':white_check_mark:' : ':x:') + ' '
  msg += t(`commands.permcheck.${granted ? 'granted' : 'denied'}`, locale)

  if (channelPermAvailable) {
    msg += '\n' + (grantedInChannel ? ':white_check_mark:' : ':x:') + ' '
    msg += `**${t(`commands.permcheck.${grantedInChannel ? 'granted' : 'denied'}InChannel`, locale)}**`
  }

  return msg
}

module.exports = PermissionCheckCommand
