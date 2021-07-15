const path = require('path')
const ExtensionHandler = require('../handlers/ExtensionHandler')
const logger = require('../shared/logger')('event:onReady')

async function onReady (client) {
  logger.log('Logged in as ' + client.user.tag)
  client.onlineMode = true

  const extHandler = new ExtensionHandler(client)
  if (!client.extensions) client.registerExtensionHandler(extHandler)
  await extHandler.registerExtensionsIn(path.join(path.resolve(), 'extensions'))
}

module.exports = onReady
