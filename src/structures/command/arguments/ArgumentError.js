class ArgumentError extends Error {
  constructor (msg, data) {
    super(msg)

    /**
     * whether the data is a flag.
     * @type {string}
     */
    this.isFlag = Boolean(data.named)

    /**
     * The position of this arg.
     * Only available for arguments.
     * @type {number|null}
     */
    this.idx = null

    /**
     * The argument which caused the error.
     */
    this.argData = data.argData

    /**
     * Previous argument values before the error.
     * @type {Array}
     */
    this.alreadyParsedArgs = []
  }
}

module.exports = ArgumentError
