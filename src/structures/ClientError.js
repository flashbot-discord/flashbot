const uuid = require('uuid-random')

class ClientError extends Error {
  constructor (err) {
    super(err)
    this.uid = uuid()
    this.message = err.message
    this.stack = err.stack
  }

  report (msg, t, logPos) {
    msg.client.logger.error(logPos, this.stack)
    msg.reply(t('ClientError.error', this.message, this.uid))
    // TODO Webhook sending system
  }
}

module.exports = ClientError
