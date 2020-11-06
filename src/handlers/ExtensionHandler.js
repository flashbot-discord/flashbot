const fs = require('fs')
const path = require('path')
const Extension = require('../structures/Extension')

class ExtensionHandler {
  constructor (client) {
    this._client = client
    this._logPos = 'ExtensionHandler'
    this.extensions = new Map()
  }

  async register (ExtClass) {
    const logPos = this._logPos + '.register'

    const Ext = new ExtClass(this._client)
    if (!(Ext instanceof Extension)) {
      this._client.logger.error(logPos, 'Cannot load extension: extension does not extends the Extension class.')
      Ext.destroy()
      return
    }

    await Ext.init()
    this.extensions.set(Ext._name, Ext)
    this._client.logger.log(logPos, `Registered extension '${Ext._name}'`)
  }

  registerExtensionsIn (extPath) {
    const logPos = this._logPos + '.registerCommandsIn'

    try {
      const folders = fs.readdirSync(extPath)

      folders.forEach(async (folder) => {
        if (!fs.lstatSync(path.join(extPath, folder)).isDirectory()) return
        this._client.logger.debug(logPos, `Loading extension '${folder}'`)

        try {
          const fullpath = path.join(extPath, folder, 'index.js')
          const ext = require(fullpath)
          await this.register(ext, fullpath)
        } catch (err) {
          this._client.logger.error(logPos, `Error loading extension '${folder}'.\n` + err.stack)
        }
      })
    } catch (err) {
      this._client.logger.error(logPos, 'Error loading folders that the extensions located.\n' + err.stack)
    }
  }
}

module.exports = ExtensionHandler
