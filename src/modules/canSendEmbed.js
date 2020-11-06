module.exports = (clientUser, channel) => {
  if (channel.type === 'dm') return true
  else if (channel.type !== 'text') return false

  return channel.permissionsFor(clientUser).has('EMBED_LINKS')
}
