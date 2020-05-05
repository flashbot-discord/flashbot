const fs = require('fs')
const path = require('path')
const Extension = require('./Extension')

class ExtensionHandler {
  constructor(client) {
    this._client = client
    this._logPos = 'ExtensionHandler'
    this.extensions = new Map()
  }

  register(extension) {
    const logPos = this._logPos + '.register'

    if(!extension instanceof Extension) return this._client.logger.error(logPos, 'Cannot load extension: extension does not extends the Extension class.')

    const Ext = new extension(this._client)
    this.extensions.set(Ext._name, Ext)
    this._client.logger.log(logPos, "Registered extension '" + Ext._name + "'")
  }

  registerExtensionsIn(extPath) {
    const logPos = this._logPos + '.registerCommandsIn'

    try {
      const folders = fs.readdirSync(extPath)

      folders.forEach((folder) => {
        if (!fs.lstatSync(path.join(extPath, folder)).isDirectory()) return
        this._client.logger.debug(logPos, "Loading extension '" + folder + "'")

        try {
          const fullpath = path.join(extPath, folder, 'index.js')
          const ext = require(fullpath)
          this.register(ext, fullpath)
        } catch (err) {
          this._client.logger.error(logPos, "Error loading extension '" + folder + "'. " + err.stack)
        }
      })
    } catch (err) {
      this._client.logger.error(logPos, 'Error loading folders that the extensions located. ' + err.stack)
    }
  }
}

module.exports = ExtensionHandler
