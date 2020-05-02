function onReady (client) {
  client.logger.log('onReady', 'FlashBot is logged in as ' + client.user.tag)
  client.user.setActivity(client.config.prefix + 'help')
}

module.exports = onReady
