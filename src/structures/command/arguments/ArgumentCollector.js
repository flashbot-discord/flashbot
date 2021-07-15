const types = require('../../types/index')
const loggerGen = require('../../../shared/logger')
const logger = loggerGen('ArgumentCollector')

class ArgumentCollector {
  constructor (parentCommand) {
    this._command = parentCommand
    this.args = []
    this.flags = {}
    this.dynamic = false
  }

  /**
   * Register a flag
   * @param {string} flagName name of the flag
   * @param {*} flagInfo information object of the flag
   */
  registerFlag (flagName, flagInfo) {
    /*
    name: string (throws Error if not provided): {
      aliases: Array<string> ([]),
      type: string|Array<string> ('any'),
      optional: boolean (false),
      default: any (undefined)
    }
    */
    logger.debug('flagName = %s', flagName)
    logger.debug('flagInfo = %O', flagInfo)

    // name
    if (flagName.length < 1) throw new Error('Flag name is empty')
    else if (flagName in this.flags) throw new Error('Flag already exists')

    // aliases
    const aliases = []
    if (Array.isArray(flagInfo.aliases)) {
      for (const alias of flagInfo.aliases) {
        if (!aliases.includes(alias)) aliases.push(alias)
      }
    }

    // type
    if (!this._validateType(flagInfo.type)) flagInfo.type = null

    // NOTE: description
    // if empty, return null to use locale parsing at execution
    const description = typeof flagInfo.description === 'string' && flagInfo.description.length > 0
      ? flagInfo.description
      : null

    // optional
    const optional = Boolean(flagInfo.optional)

    // register flag to registry
    this.flags[flagName] = {
      aliases,
      type: flagInfo.type,
      description,
      optional,
      default: flagInfo.default
    }
  }

  /**
   * Register an argument.
   * @param {*} argInfo
   */
  registerArgument (argInfo) {
    logger.debug('argInfo = %O', argInfo)

    // name
    const key = argInfo.key
    if (typeof key !== 'string' || key.length < 1) {
      throw new Error('Argument key is empty')
    } else if (this.args.some(a => a.key === key)) {
      throw new Error('Argument name already exists')
    }

    // type
    if (!this._validateType(argInfo.type)) {
      argInfo.type = null
    }

    // NOTE: description
    // if empty, return null to use locale parsing at execution
    const description = typeof argInfo.description === 'string' && argInfo.description.length > 0
      ? argInfo.description
      : null

    // optional field
    const optional = Boolean(argInfo.optional)

    // infinity field
    const infinity = Boolean(argInfo.infinity)

    this.args.push({
      key,
      type: argInfo.type,
      description,
      optional,
      default: argInfo.default,
      infinity
    })
  }

  /**
   * Register arguments
   * @param {Array} argInfosArr
   */
  registerArguments (argInfosArr) {
    /*
    {
      key: string (throws Error if not provided),
      type: string|Array<string> (null),
      optional: boolean (false),
      default: any (undefined),
      infinity: boolean (false)
    }
    */
    logger.verbose('registering args')
    // logger.debug('argInfosArr = %O', argInfosArr)

    for (const argInfo of argInfosArr) {
      this.registerArgument(argInfo)
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
    else throw new TypeError('Argument type must be string or array of string')
  }

  /**
   * Checks whether the argument registered in this collector
   * @param {string} name name of the argument
   * @returns {boolean}
   */
  has (name) {
    return this.args.some(el => el.key === name)
  }
}

module.exports = ArgumentCollector
