const fs = require('fs')
const path = require('path')
const Extension = require('../structures/Extension')
const logger = require('../shared/logger')('ExtensionHandler')

class ExtensionHandler {
  constructor (client) {
    this._client = client
    this.extensions = new Map()
  }

  async register (ExtClass) {
    const Ext = new ExtClass(this._client)
    if (!(Ext instanceof Extension)) {
      logger.error('Cannot load extension: extension does not extends the Extension class.')
      Ext.destroy()
      return
    }

    await Ext.init()
    this.extensions.set(Ext._name, Ext)
    logger.log(`Registered extension '${Ext._name}'`)
  }

  registerExtensionsIn (extPath) {
    try {
      const folders = fs.readdirSync(extPath)

      folders.forEach(async (folder) => {
        if (!fs.lstatSync(path.join(extPath, folder)).isDirectory()) return
        logger.log(`Loading extension '${folder}'`)

        try {
          const fullpath = path.join(extPath, folder, 'index.js')
          const ext = require(fullpath)
          await this.register(ext, fullpath)
        } catch (err) {
          logger.error(`Error loading extension '${folder}'.\n` + err.stack)
        }
      })
    } catch (err) {
      logger.error('Error loading folders that the extensions located.\n' + err.stack)
    }
  }
}

module.exports = ExtensionHandler
