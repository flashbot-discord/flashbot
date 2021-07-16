const { MessageEmbed, Collection } = require('discord.js')

const Command = require('../_Command')
const EMOJIS = require('../../shared/emojis')

const permList = new Collection([
  ['ADMINISTRATOR', { channelType: null }],
  ['VIEW_AUDIT_LOG', { channelType: null }],
  ['MANAGE_GUILD', { channelType: null }],
  ['MANAGE_ROLES', { channelType: 'all', dm: false }],
  ['MANAGE_CHANNELS', { channelType: 'all', dm: true }],
  ['KICK_MEMBERS', { channelType: null }],
  ['BAN_MEMBERS', { channelType: null }],
  ['CREATE_INSTANT_INVITE', { channelType: 'all', dm: false }],
  ['CHANGE_NICKNAME', { channelType: null }],
  ['MANAGE_NICKNAMES', { channelType: null }],
  ['MANAGE_EMOJIS', { channelType: null }],
  ['MANAGE_WEBHOOKS', { channelType: 'text', dm: false }],
  ['VIEW_CHANNEL', { channelType: 'all', dm: true }],
  ['SEND_MESSAGES', { channelType: 'text', dm: true }],
  ['SEND_TTS_MESSAGES', { channelType: 'text', dm: false }],
  ['MANAGE_MESSAGES', { channelType: 'text', dm: false }],
  ['EMBED_LINKS', { channelType: 'text', dm: true }],
  ['ATTACH_FILES', { channelType: 'text', dm: true }],
  ['READ_MESSAGE_HISTORY', { channelType: 'text', dm: true }],
  ['MENTION_EVERYONE', { channelType: 'text', dm: true }],
  ['USE_EXTERNAL_EMOJIS', { channelType: 'text', dm: true }],
  ['ADD_REACTIONS', { channelType: 'text', dm: true }],
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
      aliases: ['perm', 'perms', 'permission', 'permissions', '권한확인', '권한', 'ㅔㄷ그촏차', 'ㅔㄷ그', 'ㅔㄷ근', 'ㅔㄷ그ㅑㄴ냐ㅐㅜ', 'ㅔㄷ그ㅑㄴ냐ㅐㅜㄴ', 'rnjsgksghkrdls', 'rnjsgks'],
      group: 'info',
      guildOnly: true
    })
  }

  * args (msg) {
    const { target } = yield {
      arg: {
        key: 'target',
        type: 'member',
        optional: true,
        default: msg.member
      }
    }

    const { channel } = yield {
      arg: {
        key: 'channel',
        type: 'channel',
        optional: true,
        default: msg.channel
      }
    }

    return { target, channel }
  }

  async run (client, msg, query, { t }) {
    const useEmbed = msg.channel.type === 'dm' || msg.channel.permissionsFor(client.user).has('EMBED_LINKS')

    const targetUser = query.args.target
    const targetChannel = query.args.channel
    const serverPerms = targetUser.permissions
    const channelPerms = msg.channel.type !== 'dm' ? targetChannel.permissionsFor(targetUser) : null

    const thisServerText = t('commands.permcheck.thisServer')

    let output
    if (useEmbed) {
      const embed = new MessageEmbed()
        .setAuthor(targetUser.user.tag, targetUser.user.avatarURL())
        .setTitle(t('commands.permcheck.embed.title'))

      let descText = ''
      if (targetUser.id === msg.guild.owner.id) {
        descText += t('commands.permcheck.isOwner')
      } else if (targetUser.permissions.has('ADMINISTRATOR')) {
        descText += t('commands.permcheck.isAdmin')
      }

      descText += `\n:computer: ${thisServerText}\n:tv: ${targetChannel.toString()}\n\n:computer: | :tv:\n`

      const availablePermList = filterPermList(permList, targetChannel.type)
      availablePermList.forEach((obj, perm) => {
        descText += makePermsMsg({
          granted: serverPerms.has(perm),
          grantedInChannel: obj.channelType != null ? channelPerms.has(perm) : null
        }, t) + ` - ${t(`perms.${perm}`)}\n`
      })

      embed.setDescription(descText)
      output = embed
    } else {
      let str = `**${t('commands.permcheck.noEmbed.title', targetUser.user.tag)}**\n`

      if (targetUser.id === msg.guild.owner.id) {
        str += `> ${t('commands.permcheck.isOwner')}`
      } else if (targetUser.permissions.has('ADMINISTRATOR')) {
        str += `> ${t('commands.permcheck.isAdmin')}`
      }

      str += `\n:computer: ${thisServerText}\n:tv: ${targetChannel.toString()}\n\n:computer: | :tv:\n`

      const availablePermList = filterPermList(permList, targetChannel.type)
      availablePermList.forEach((obj, perm) => {
        str += makePermsMsg({
          granted: serverPerms.has(perm),
          grantedInChannel: obj.channelType != null ? channelPerms.has(perm) : null
        }, t) + ` - ${t(`perms.${perm}`)}\n`
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

  msg += (granted ? EMOJIS.white_check_mark : EMOJIS.x) + ' | '

  if (channelPermAvailable) {
    msg += (grantedInChannel ? EMOJIS.white_check_mark : EMOJIS.x)
  } else {
    msg += ':black_large_square:'
  }

  return msg
}

module.exports = PermissionCheckCommand
