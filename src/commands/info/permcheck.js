const { MessageEmbed, Collection } = require('discord.js')

const Command = require('../_Command')

const permList = new Collection([
  ['ADMINISTRATOR', { channelType: null }],
  ['VIEW_AUDIT_LOG', { channelType: null }],
  ['MANAGE_GUILD', { channelType: null }],
  ['MANAGE_ROLES', { channelType: 'all' }],
  ['MANAGE_CHANNELS', { channelType: 'all' }],
  ['KICK_MEMBERS', { channelType: null }],
  ['BAN_MEMBERS', { channelType: null }],
  ['CREATE_INSTANT_INVITE', { channelType: 'all' }],
  ['CHANGE_NICKNAME', { channelType: null }],
  ['MANAGE_NICKNAMES', { channelType: null }],
  ['MANAGE_EMOJIS', { channelType: null }],
  ['MANAGE_WEBHOOKS', { channelType: 'text' }],
  ['VIEW_CHANNEL', { channelType: 'all' }],
  ['SEND_MESSAGES', { channelType: 'text' }],
  ['SEND_TTS_MESSAGES', { channelType: 'text' }],
  ['MANAGE_MESSAGES', { channelType: 'text' }],
  ['EMBED_LINKS', { channelType: 'text' }],
  ['ATTACH_FILES', { channelType: 'text' }],
  ['READ_MESSAGE_HISTORY', { channelType: 'text' }],
  ['MENTION_EVERYONE', { channelType: 'text' }],
  ['USE_EXTERNAL_EMOJIS', { channelType: 'text' }],
  ['ADD_REACTIONS', { channelType: 'text' }],
  ['CONNECT', { channelType: 'voice' }],
  ['SPEAK', { channelType: 'voice' }],
  ['MUTE_MEMBERS', { channelType: 'voice' }],
  ['DEAFEN_MEMBERS', { channelType: 'voice' }],
  ['MOVE_MEMBERS', { channelType: 'voice' }],
  ['USE_VAD', { channelType: 'voice' }]
])

class PermissionCheckCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'permcheck',
      aliases: ['perm', 'perms', 'permission', 'permissions', '권한확인', '권한', 'ㅔㄷ그', 'ㅔㄷ근', 'ㅔㄷ그ㅑㄴ냐ㅐㅜ', 'ㅔㄷ그ㅑㄴ냐ㅐㅜㄴ', 'rnjsgksghkrdls', 'rnjsgks'],
      description: 'commands.permcheck.DESC',
      group: 'info'
    })
  }

  async run (client, msg, _query, { t }) {
    const useEmbed = msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    const targetUser = msg.mentions.members.size > 0 ? msg.mentions.members.first() : msg.member
    const targetChannel = msg.mentions.channels.size > 0 ? msg.mentions.channels.first() : msg.channel
    const serverPerms = targetUser.permissions
    const channelPerms = targetChannel.permissionsFor(targetUser)

    let output
    if (useEmbed) {
      const embed = new MessageEmbed()
        .setAuthor(targetUser.user.tag, targetUser.user.avatarURL())
        .setTitle(t('commands.permcheck.embed.title'))

      let descText = t('commands.permcheck.embed.channelName', targetChannel.toString()) + '\n\n'
      if (targetUser.id === msg.guild.owner.id) {
        descText += t('commands.permcheck.isOwner')
      } else if (targetUser.permissions.has('ADMINISTRATOR')) {
        descText += t('commands.permcheck.isAdmin')
      }
      embed.setDescription(descText)

      const availablePermList = filterPermList(permList, targetChannel.type)
      availablePermList.forEach((obj, perm) => {
        embed.addField(t(`perms.${perm}`), makePermsMsg({
          granted: serverPerms.has(perm),
          grantedInChannel: obj.channelType != null ? channelPerms.has(perm) : null
        }, t))
      })

      output = embed
    } else {
      let str = t('commands.permcheck.noEmbed.title', targetUser.user.tag, targetChannel.toString()) + '\n'

      if (targetUser.id === msg.guild.owner.id) {
        str += `> ${t('commands.permcheck.isOwner')}`
      } else if (targetUser.permissions.has('ADMINISTRATOR')) {
        str += `> ${t('commands.permcheck.isAdmin')}`
      }

      str += '\n\n'

      const availablePermList = filterPermList(permList, targetChannel.type)
      availablePermList.forEach((obj, perm) => {
        str += `**${t(`perms.${perm}`)}**\n` +
          makePermsMsg({
            granted: serverPerms.has(perm),
            grantedInChannel: obj.channelType != null ? channelPerms.has(perm) : null
          }, t) +
          '\n\n'
      })

      output = str
    }

    msg.channel.send(output)
  }
}

function filterPermList (list, channelType) {
  return list.filter((item) => {
    return item.channelType === null ||
      item.channelType === 'all' ||
      item.channelType === channelType
  })
}

function makePermsMsg (opts, t) {
  const { granted, grantedInChannel } = opts
  let msg = ''

  const channelPermAvailable = typeof grantedInChannel === 'boolean'

  msg += (granted ? ':white_check_mark:' : ':x:') + ' '
  msg += t(`commands.permcheck.${granted ? 'granted' : 'denied'}`)

  if (channelPermAvailable) {
    msg += '\n' + (grantedInChannel ? ':white_check_mark:' : ':x:') + ' '
    msg += `**${t(`commands.permcheck.${grantedInChannel ? 'granted' : 'denied'}InChannel`)}**`
  }

  return msg
}

module.exports = PermissionCheckCommand
