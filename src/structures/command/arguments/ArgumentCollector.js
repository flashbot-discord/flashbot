const types = require('../../types/index')
const loggerGen = require('../../../modules/logger')
const logger = loggerGen('ArgumentCollector')

class ArgumentCollector {
  constructor (parentCommand) {
    this._command = parentCommand
    this.args = { named: {}, unnamed: [] }
    this.dynamic = false
  }

  /**
   * Register named argument
   * @param {string} argName name of the argument
   * @param {*} argInfo information object of the argument
   */
  registerNamedArgument (argName, argInfo) {
    /*
    name: string (throws Error if not provided): {
      aliases: Array<string> ([]),
      type: string|Array<string> ('any'),
      optional: boolean (false),
      default: any (undefined)
    }
    */
    logger.debug('argName = %s', argName)
    logger.debug('argInfo = %O', argInfo)

    // name
    if (argName in this.args.named) throw new Error('Argument name already exists')

    // aliases
    const aliases = []
    if (Array.isArray(argInfo.aliases)) {
      for (const alias of argInfo.aliases) {
        if (!aliases.includes(alias)) aliases.push(alias)
      }
    } else if (argInfo.aliases != null) throw new TypeError('Argument aliases must be Array<string> or null')

    // type
    if (!this._validateType(argInfo.type)) argInfo.type = null

    // optional
    const optional = Boolean(argInfo.optional)

    // register arg to registry
    this.args.named[argName] = {
      aliases,
      type: argInfo.type,
      optional,
      default: argInfo.default
    }
  }

  /**
   * Register unnamed arguments
   * @param {Array} argInfosArr
   */
  registerUnnamedArguments (argInfosArr) {
    /*
    {
      key: string (throws Error if not provided),
      type: string|Array<string> (null),
      optional: boolean (false),
      default: any (undefined),
      infinity: boolean (false)
    }
    */
    logger.verbose('registering unnamed args')
    logger.debug('argInfosArr = %O', argInfosArr)

    for (const argInfo of argInfosArr) {
      logger.debug('argInfo = %O', argInfo)

      // name
      const key = argInfo.key
      if (typeof key !== 'string' || key.length < 1) throw new Error('Argument key is empty')
      else if (this.args.unnamed.some(a => a.key === key)) throw new Error('Argument name already exists')

      // type
      if (!this._validateType(argInfo.type)) argInfo.type = null
      // optional field
      const optional = Boolean(argInfo.optional)

      // infinity field
      const infinity = Boolean(argInfo.infinity)

      this.args.unnamed.push({
        key,
        type: argInfo.type,
        optional,
        default: argInfo.default,
        infinity
      })
    }
  }

  /**
   * Check whether the type is registered
   * @param {string} type type to check
   * @returns {boolean} is the type registered
   * @private
   */
  _validateType (type) {
    if (typeof type === 'string') {
      if (types[type] == null) throw new TypeError(`Invalid argument type '${type}'`)
      else return true
    } else if (Array.isArray(type)) {
      if (!type.every(t => types[t] != null)) throw new TypeError(`Invalid argument type in one of ['${type.join('\', \'')}']`)
      else return true
    } else if (type == null) return false
    else throw new TypeError('Argument type must be string, Array<string> or null')
  }

  /**
   * Checks whether the argument registered in this collector
   * @param {string} name name of the argument
   * @returns {boolean}
   */
  has (name) {
    return name in this.args.named ||
      this.args.unnamed.some(el => el.key === name)
  }
}

module.exports = ArgumentCollector
