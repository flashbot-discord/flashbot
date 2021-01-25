module.exports = (logger) => {
  const log = (msg) => {
    if (logger) logger.log(msg)
    else console.log(msg)
  }

  log('Setting up Global Properties and Functions')

  // eslint-disable-next-line no-extend-native
  Array.prototype.asyncForEach = async function (callback) {
    for (let i = 0; i < this.length; i++) {
      await callback(this[i], i, this)
    }
  }
  log('Array.prototype.asyncForEach has been set up')
}
