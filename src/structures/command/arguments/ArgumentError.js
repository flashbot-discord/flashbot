class ArgumentError extends Error {
  constructor (msg, data) {
    super(msg)

    /**
     * whether the arg is named.
     * @type {string}
     */
    this.named = Boolean(data.named)

    if (!this.named) {
      /**
       * the index number of arg. Only available for unnamed arg.
       * @type {number|null}
       */
      this.index = typeof data.index === 'number' ? data.index : null
    }

    this.argData = data.argData
  }
}

module.exports = ArgumentError
