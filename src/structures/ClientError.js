const uuid = require('uuid-random')

class ClientError extends Error {
  constructor (err) {
    super(err)
    this.uid = uuid()
    this.message = err.message
    this.stack = err.stack
  }

  report (msg, locale, logPos) {
    msg.client.logger.error(logPos, this.stack)
    msg.reply(msg.client.locale.t('ClientError.error', locale, this.message, this.uid))
    // TODO Webhook sending system
  }
}

module.exports = ClientError
