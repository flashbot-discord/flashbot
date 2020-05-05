const path = require('path')
const ExtensionHandler = require('../classes/ExtensionHandler')

function onReady (client) {
  client.logger.log('onReady', 'FlashBot is logged in as ' + client.user.tag)
  client.user.setActivity(client.config.prefix + 'help')

  const extHandler = new ExtensionHandler(client)
  if(!client.extensions) client.registerExtensionHandler(extHandler)
  extHandler.registerExtensionsIn(path.join(path.resolve(), 'extensions'))
}

module.exports = onReady
