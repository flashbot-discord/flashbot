const canSendEmbed = (user, channel) => {
  if (channel.type === 'dm') return true
  else if (channel.type !== 'text') return null

  return channel.permissionsFor(user).has('EMBED_LINKS')
}

const canManageMessages = (user, channel) => {
  if (channel.type === 'dm') return false
  else if (channel.type !== 'text') return null

  return channel.permissionsFor(user).has('MANAGE_MESSAGES')
}

module.exports = {
  canSendEmbed,
  canManageMessages
}
