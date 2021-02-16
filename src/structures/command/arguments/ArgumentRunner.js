const minimist = require('minimist')

const types = require('../../types/index')
const ArgumentError = require('./ArgumentError')
const _logger = require('../../../modules/logger')('ArgumentRunner')

/**
 * Get raw arguments and run them
 * @param {Message} message The message to run command
 * @param {Command} command Command to use args
 * @param {Array<string>} rawArgs Raw argument from user input
 * @returns {*} Runned argument data
 */
async function runArgs (msg, command, rawArgs) {
  const logger = _logger.extend('runArgs')
  const collector = command._args

  const parsedArgs = {}
  let namedArgs = {}
  let unnamedArgs = {}
  let unnamedArgsToRun

  if (collector.dynamic) {
    logger.verbose('is dynamic args')
    return await runDynamicArgs(msg, command, rawArgs)
  }

  if (Object.keys(collector.args.named).length > 0) {
    logger.verbose('running named args')

    namedArgs = await runNamedArgs(msg, collector.args.named, rawArgs)
    if (namedArgs._) {
      logger.verbose('unnamed args are included')
      unnamedArgsToRun = namedArgs._
      delete namedArgs._
    }
  }
  if (collector.args.unnamed.length > 0) {
    logger.verbose('running unnamed args')

    unnamedArgs = await runUnnamedArgs(
      msg,
      collector.args.unnamed,
      Array.isArray(unnamedArgsToRun) ? unnamedArgsToRun : rawArgs
    )
  }

  // NOTE: assign unnamed args first
  Object.assign(parsedArgs, unnamedArgs)
  Object.assign(parsedArgs, namedArgs)

  logger.debug('final args: %O', parsedArgs)
  return parsedArgs
}

/**
 * Run named arguments
 * @param {Array} argsArr Array of named arguments
 * @private
 */
async function runNamedArgs (msg, argDataList, argsArr, stopEarly = false) {
  const logger = _logger.extend('runNamedArgs')

  const booleanTypedArgs = []
  const stringTypedArgs = []
  const aliases = {}

  logger.verbose('parsing named args')

  for (const argName in argDataList) {
    const arg = argDataList[argName]
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
    alias: aliases,
    stopEarly
  })
  logger.debug('raw minimist output: %O', parsedArgs)

  const finalArgs = {}

  // unnamed args inside named args
  if (parsedArgs._) {
    logger.verbose('found unnamed args in parsedArgs')
    finalArgs._ = parsedArgs._
  }

  for (const argName in argDataList) {
    const argData = argDataList[argName]
    const arg = parsedArgs[argName]
    logger.debug('using argData: %O', argData)
    logger.debug('arg value to parse: %O', arg)

    let data
    try {
      data = await processArg(msg, arg, argData)
    } catch (e) {
      e.named = true
      throw e
    }
    finalArgs[argName] = data.arg
  }

  logger.debug('final parsed named args: %O', finalArgs)
  return finalArgs
}

/**
   * Parses unnamed arguments
   * @param {Array} argsArr array of unnamed arguments
   * @private
   */
async function runUnnamedArgs (msg, argDataList, argsArr) {
  const logger = _logger.extend('runUnnamedArgs')
  const parsedArgs = {}
  let ignoreAfter = false

  logger.verbose('parsing unnamed args')
  logger.debug('argDataList: %O', argDataList)
  logger.debug('argsArr: %O', argsArr)

  let idx = 0
  for (const argData of argDataList) {
    if (ignoreAfter) break

    logger.debug('using argData: %O', argData)

    let arg

    // NOTE: 'text' type contains strings including spaces
    if (argData.type === 'text') {
      arg = argsArr.slice(idx).join(' ')
      ignoreAfter = true
    } else if (argData.infinity) arg = argsArr.slice(idx)
    else arg = argsArr[idx]

    logger.debug('using argv: %O', arg)

    let data
    try {
      data = await processArg(msg, arg, argData)
    } catch (e) {
      e.named = false
      e.idx = idx
      throw e
    }
    if (data != null && data.ignoreAfter) ignoreAfter = true
    parsedArgs[argData.key] = data.arg

    idx++
  }

  logger.debug('final parsed unnamed args: %O', parsedArgs)
  return parsedArgs
}

async function runDynamicArgs (msg, command, argsArr) {
  const logger = _logger.extend('runDynamicArgs')
  let rawArgs = argsArr.slice()
  const iter = command.args(msg)

  let current = iter.next()
  while (!current.done) {
    // NOTE: handle multiple named args, but only one unnamed arg in one time
    const parsedArgs = {}
    let parsedNamedArgs
    let parsedUnnamedArgs

    logger.debug('current: %O', current)
    const data = current.value

    if (data.named && typeof data.named === 'object') {
      parsedNamedArgs = await runNamedArgs(msg, data.named, rawArgs, true)
      rawArgs = parsedNamedArgs._
    }

    if (data.unnamed && typeof data.unnamed === 'object') {
      const arg = rawArgs.shift()
      parsedUnnamedArgs = await runUnnamedArgs(msg, [data.unnamed], [arg])
    }

    Object.assign(parsedArgs, parsedUnnamedArgs)
    Object.assign(parsedArgs, parsedNamedArgs)

    // Object.assign(finalArgs, parsedArgs)
    current = iter.next(parsedArgs)
  }

  const finalArgs = current.value

  logger.debug('final parsed dynamic args: %O', finalArgs)
  return finalArgs
}

/**
   * Validates arg value with the type
   * @param {string|Array<string>} arg The argument value, array of string if infinity arguments
   * @param {string} type type of the argument
   * @private
   */
async function processArg (msg, arg, argData) {
  const logger = _logger.extend('processArg')

  // NOTE: check if arg is empty
  if (arg == null) {
    logger.debug('argument is empty')
    if (!argData.optional) {
      throw new ArgumentError('non-optional argument is missing', { argData })
    }
  }

  let usedType
  const returnObj = {
    arg: null,
    ignoreAfter: false
  }

  // NOTE: handle infinity args (and not text)
  if (argData.infinity && argData.type !== 'text') {
    logger.verbose('processing infinity args')
    const args = arg.slice() // clone
    const arr = []
    for (const a of args) {
      usedType = await validateValue(msg, a, argData.type)
      logger.debug('argv: %O, usedType: %O', a, usedType)

      if (usedType) {
        arr.push(await types[usedType].parse(msg, a))
      } else break
    }

    returnObj.arg = arr
    returnObj.ignoreAfter = true
  } else {
    // NOTE: handle normal args
    logger.verbose('processing non-infinity args')

    usedType = await validateValue(msg, arg, argData.type)
    logger.debug('usedType: %O', usedType)

    // NOTE: throw Error if type mismatch
    if (!usedType && !argData.optional) {
      throw new ArgumentError('argument type mismatch', {
        argData
      })
    }

    if (usedType) {
      const parsedValue = await types[usedType].parse(msg, arg)
      returnObj.arg = argData.optional
        ? parsedValue != null
          ? parsedValue
          : argData.default != null ? argData.default : null
        : parsedValue
    } else {
      returnObj.arg = argData.optional ? argData.default : null
    }
  }

  return returnObj
}

async function validateValue (msg, arg, type) {
  let usedType
  if (Array.isArray(type)) {
    usedType = type.find(async t => await types[t].validate(msg, arg))
    // return usedType != null ? usedType : null
  } else {
    usedType = await types[type].validate(msg, arg) ? type : null
  }

  return usedType
}

module.exports = {
  runArgs
}
