module.exports = (client) => {
  const logPos = 'globalElements'
  client.logger.log(logPos, 'Setting up Global Properties and Functions')

  Array.prototype.asyncForEach = async function(callback) {
    for (let i = 0; i < this.length; i++) {
      await callback(this[i], i, this)
    }
  }
  client.logger.log(logPos, 'Array.prototype.asyncForEach has been set up')
}