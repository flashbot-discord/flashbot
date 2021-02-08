const minimist = require('minimist')

const types = require('../types/index')
const ArgumentError = require('./ArgumentError')
const loggerGen = require('../../modules/logger')
const logger = loggerGen('ArgumentCollector')

class ArgumentCollector {
  constructor (parentCommand) {
    this._command = parentCommand
    this.args = { named: {}, unnamed: [] }
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
      optional
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
      if (!type.every(t => types[t] != null)) throw new TypeError(`Invalid argument type in one of ['${type.join(`', '`)}']`)
      else return true
    } else if (type == null) return false
    else throw new TypeError('Argument type must be string, Array<string> or null')
  }

  /**
   * Parses arguments
   * @param {Object|Array} rawArgs
   * @returns {Object}
   */
  async parseArguments (msg, rawArgs) {
    const useNamedArgs = Object.keys(this.args.named).length > 0

    if (useNamedArgs) return await this._parseNamedArgs(msg, rawArgs)
    else return await this._parseUnnamedArgs(msg, rawArgs)
  }

  /**
   * Parses named arguments
   * @param {Array} argsArr array of named arguments
   * @private
   */
  async _parseNamedArgs (msg, argsArr) {
    const booleanTypedArgs = []
    const stringTypedArgs = []
    const aliases = {}

    logger.verbose('parsing named args')
    for (const argName in this.args.named) {
      const arg = this.args.named[argName]
      logger.debug('arg info: %O', arg)

      // Check boolean/string typed args
      // to pass it to minimist
      if (arg.type === 'boolean') booleanTypedArgs.push(argName)
      else if (arg.type === 'string') stringTypedArgs.push(argName)

      // Aliases
      if (arg.aliases) aliases[argName] = arg.aliases
    }

    // minimist
    const parsedArgs = minimist(argsArr, {
      boolean: booleanTypedArgs,
      string: stringTypedArgs,
      alias: aliases
    })

    const finalArgs = {}

    // Check
    for (const argName in parsedArgs) {
      const arg = parsedArgs[argName]

      // unnamed args inside named args
      if (argName === '_') {
        Object.assign(finalArgs, await this._parseUnnamedArgs(msg, arg))
      } else {
        const argData = this.args.named[argName]

        if (!argData) continue

        const usedType = await this._validateArg(msg, arg, argData.type)
        if (!usedType) {
          const throwObj = {
            error: true,
            named: true,
            argData
          }
          throw throwObj
        }

        finalArgs[argName] = await types[usedType].parse(arg)
      }
    }

    return finalArgs
  }

  /**
   * Parses unnamed arguments
   * @param {Array} argsArr array of unnamed arguments
   * @private
   */
  async _parseUnnamedArgs (msg, argsArr) {
    const parsedArgs = {}
    let ignoreAfter = false

    const argInfos = this.args.unnamed
    logger.verbose('parsing unnamed args')
    logger.debug('argInfos = %O', argInfos)

    let idx = 0
    for (const argData of argInfos) {
      if (ignoreAfter) break

      logger.debug('using argData: %O', argData)
      const arg = argsArr[0]

      // NOTE: check if arg is empty
      if (arg == null) {
        logger.debug('argument is empty')
        if (!argData.optional) throw new ArgumentError('non-optional argument is missing', {
          named: false,
          index: idx,
          argData
        })
        else continue
      }

      // NOTE: validate arg type
      // 'text' type contains strings including spaces
      if (argData.type === 'text') {
        arg = argsArr.join(' ')
        ignoreAfter = true
      }

      let usedType

      // NOTE: handle infinity args (and not text)
      if (argData.infinity && argData.type !== 'text') {
        logger.verbose('processing infinity args')
        const args = argsArr
        const arr = []
        for (const a of args) {
          usedType = await this._validateValue(msg, a, argData.type)
          if (usedType) {
            arr.push(await types[usedType].parse(msg, a))
            argsArr.shift()
          }
          else break
        }

        parsedArgs[argData.key] = arr
        ignoreAfter = true

      } else {
        // NOTE: handle normal args
        logger.verbose('processing non-infinity args')

        usedType = await this._validateValue(msg, arg, argData.type)
        logger.debug('usedType = %O', usedType)

        // NOTE: throw Error if type mismatch
        if (!usedType) {
          throw new ArgumentError('type mismatch', {
            named: false,
            index: idx,
            argData
          })
        }

        parsedArgs[argData.key] = await types[usedType].parse(msg, arg)

      }

      idx++
    }

    logger.debug('final parsed args: %O', parsedArgs)
    return parsedArgs
  }

  /**
   * Validates arg value with the type
   * @param {string} arg the argument value
   * @param {string} type type of the argument
   * @private
   */
  async _validateValue (msg, arg, type) {
    if (Array.isArray(type)) {
      const usedType = type.find(async t => await types[t].validate(msg, arg))
      return usedType != null ? usedType : null
    } else {
      return await types[type].validate(msg, arg) ? type : null
    }
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
