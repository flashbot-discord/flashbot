const uuid = require('uuid-random')

class ClientError extends Error {
  constructor (msg) {
    super(msg)
    this.uid = uuid()
  }

  async report (msg, locale) {
    await msg.reply(msg.client.locale.t('ClientError.error:' +
      'An Error occured. Please report this error message and the Error ID to the Support server.\n' +
        'Error message: ```\n%1$s\n```\n' +
        'Error ID: `%2$s`', locale, this.message, this.uid))
    // TODO Webhook sending system
  }
}

module.exports = ClientError
