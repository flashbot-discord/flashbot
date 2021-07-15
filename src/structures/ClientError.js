const uuid = require('uuid-random')

const loggerGen = require('../shared/logger')

class ClientError extends Error {
  constructor (err) {
    super(err)
    this.uid = uuid()
    this.message = err.message
    this.stack = err.stack
  }

  report (msg, t, logPos) {
    const logger = loggerGen(logPos)
    logger.error(this.stack)
    msg.reply(t('ClientError.error', this.message, this.uid))
    // TODO Webhook sending system
  }
}

module.exports = ClientError
