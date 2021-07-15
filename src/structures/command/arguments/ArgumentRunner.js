const minimist = require('minimist')

const types = require('../../types/index')
const ArgumentError = require('./ArgumentError')
const _logger = require('../../../shared/logger')('ArgumentRunner')

/**
 * Get raw arguments and run them
 * @param {import('discord.js').Message} message The message to run command
 * @param {Command} command Command to use args
 * @param {Array<string>} rawInput Raw input from user input
 * @returns {*} Runned argument data
 */
async function runArgs (msg, command, rawInput) {
  const logger = _logger.extend('runArgs')
  const collector = command._args

  const parsedData = {}
  let data
  let flags = {}
  let args = {}
  let argsToRun

  // NOTE: check if command uses dynamic args
  if (collector.dynamic) {
    logger.verbose('is dynamic args')
    return await runDynamic(msg, command, rawInput)
  }

  // NOTE: process flags first with minimist
  if (Object.keys(collector.flags).length > 0) {
    logger.verbose('processing flags')

    data = await runFlags(msg, collector.flags, rawInput)
    flags = data.flags

    if (data.notParsedArgs) {
      logger.verbose('arguments are included')
      argsToRun = data.notParsedArgs
    }
  }

  // NOTE: run arguments if collector has at least 1 argument data
  if (collector.args.length > 0) {
    logger.verbose('processing arguments')

    args = await runArguments(
      msg,
      collector.args,
      Array.isArray(argsToRun) ? argsToRun : rawInput
    )
  }

  // NOTE: assign arguments first, then flags
  Object.assign(parsedData, args)
  Object.assign(parsedData, flags)

  logger.debug('final data: %O', parsedData)
  return parsedData
}

/**
 * Run flags
 * @param {import('discord.js').Message} msg The message which triggered the command
 * @param {Array} flagDataList
 * @param {Array} inputArr Array of flags
 * @param {boolean} stopEarly
 * @private
 */
async function runFlags (msg, flagDataList, inputArr, stopEarly = false) {
  const logger = _logger.extend('runFlags')

  const booleanTypedFlags = []
  const stringTypedFlags = []
  const aliases = {}

  logger.verbose('parsing flags')

  for (const flagName in flagDataList) {
    const flag = flagDataList[flagName]
    logger.debug('flag info: %O', flag)

    // Check boolean/string typed flags
    // to pass it to minimist
    if (flag.type === 'boolean') booleanTypedFlags.push(flagName)
    else if (flag.type === 'string') stringTypedFlags.push(flagName)

    // Aliases
    if (flag.aliases) aliases[flagName] = flag.aliases
  }

  // parse flags with minimist
  const parsedFlags = minimist(inputArr, {
    boolean: booleanTypedFlags,
    string: stringTypedFlags,
    alias: aliases,
    stopEarly
  })
  logger.debug('raw minimist output: %O', parsedFlags)

  const finalData = {
    flags: {},
    notParsedArgs: []
  }

  // NOTE: not parsed datas are arguments
  if (parsedFlags._) {
    logger.verbose('found unparsed args from input')
    finalData.notParsedArgs = parsedFlags._
    delete parsedFlags._
  }

  // NOTE: Validate flag value
  for (const flagName in flagDataList) {
    const flagData = flagDataList[flagName]
    const flag = parsedFlags[flagName]
    logger.debug('using flagData: %O', flagData)
    logger.debug('flag value to parse: %O', flag)

    let data
    try {
      data = await validateType(msg, flag, flagData)
    } catch (e) {
      // TODO: hmm
      e.isFlag = true
      throw e
    }
    finalData.flags[flagName] = data.arg
  }

  logger.debug('final parsed data: %O', finalData)
  return finalData
}

/**
 * Parses an argument.
 * @param {import('discord.js').Message} msg The message which triggerd the command
 * @param {*} argData argument data
 * @param {string} arg argument value
 * @returns {Promise} parsed argument data
 * @private
 */
async function runArgument (msg, argData, arg) {
  const logger = _logger.extend('runArgument')
  logger.debug('using argData: %O', argData)
  logger.debug('using argv: %O', arg)

  let data
  try {
    data = await validateType(msg, arg, argData)
  } catch (e) {
    // TODO: hmm
    e.isFlag = false
    throw e
  }

  return data
}

/**
   * Parse arguments
   * @param {import('discord.js').Message} msg The message which triggered the command
   * @param {Array} argDataList list of argument data
   * @param {Array<string>} argsArr array of arguments
   * @private
   */
async function runArguments (msg, argDataList, argsArr) {
  const logger = _logger.extend('runArguments')
  const parsedArgs = {}
  let ignoreAfter = false

  logger.verbose('parsing arguments')
  logger.debug('argDataList: %O', argDataList)
  logger.debug('argsArr: %O', argsArr)

  let idx = 0
  for (const argData of argDataList) {
    if (ignoreAfter) break

    let arg

    // NOTE: 'text' type contains strings including spaces
    if (argData.type === 'text') {
      arg = argsArr.slice(idx).join(' ')
      ignoreAfter = true
    } else if (argData.infinity) arg = argsArr.slice(idx)
    else arg = argsArr[idx]

    let data
    try {
      data = await runArgument(msg, argData, arg)
    } catch (e) {
      e.idx = idx
      throw e
    }

    if (data != null && data.ignoreAfter) ignoreAfter = true

    parsedArgs[argData.key] = data.arg

    idx++
  }

  logger.debug('final parsed arguments: %O', parsedArgs)
  return parsedArgs
}

async function runDynamic (msg, command, rawInput) {
  const logger = _logger.extend('runDynamic')
  let inputArr = rawInput.slice() // copy
  const iter = command.args(msg)

  let argIdx = 0
  const previouslyParsedArgs = []

  let current = iter.next()
  while (!current.done) {
    // NOTE: handle multiple flags, but only one argument in one time
    const parsedData = {}
    let parsedFlags
    const parsedArguments = {}

    logger.debug('current: %O', current)
    const data = current.value

    // NOTE: run flags first
    if (data.flags && typeof data.flags === 'object') {
      const parsedData = await runFlags(msg, data.flags, inputArr, true)
      parsedFlags = parsedData.flags
      inputArr = parsedData.notParsedArgs
    }

    // NOTE: run arguments
    if (data.arg && typeof data.arg === 'object') {
      const arg = inputArr.shift()
      // parsedArguments = await runArguments(msg, [data.arg], [arg])

      // NOTE: validate value and handle if mismatch
      let parsedArg
      try {
        parsedArg = await runArgument(msg, data.arg, arg)
      } catch (e) {
        e.idx = argIdx
        e.alreadyParsedArgs = previouslyParsedArgs
        throw e
      }

      parsedArguments[data.arg.key] = parsedArg.arg
      previouslyParsedArgs.push(parsedArg.arg)
      argIdx++
    }

    Object.assign(parsedData, parsedArguments)
    Object.assign(parsedData, parsedFlags)

    // Object.assign(finalArgs, parsedArgs)
    current = iter.next(parsedData)
  }

  const finalArgs = current.value

  logger.debug('final parsed dynamic args: %O', finalArgs)
  return finalArgs
}

/**
   * Validates arg value with the type
   * @param {string|Array<string>} value The flag value or argument value, array of string if infinity arguments
   * @param {Object} argData The data of the argument
   * @private
   */
async function validateType (msg, value, argData) {
  const logger = _logger.extend('validateType')

  // NOTE: check if value is empty
  if (value == null) {
    logger.debug('value is empty')
    if (!argData.optional) {
      throw new ArgumentError('non-optional flag/argument is missing', { argData })
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
    const args = value.slice() // clone
    const arr = []
    for (const a of args) {
      usedType = await validateValue(msg, a, argData.type)
      logger.debug('argv: %O, usedType: %O', a, usedType)

      if (usedType) {
        arr.push(await types[usedType].parse(msg, a))
      } else break
    }

    // NOTE: throw ArgumentError when matched arg is none and not optional
    if (arr.length < 1) {
      throw new ArgumentError('No arguments found which has correct type', { argData })
    }

    returnObj.arg = arr
    returnObj.ignoreAfter = true
  } else {
    // NOTE: handle normal args
    logger.verbose('processing non-infinity args')

    usedType = await validateValue(msg, value, argData.type)
    logger.debug('usedType: %O', usedType)

    // NOTE: throw Error if type mismatch
    if (!usedType && !argData.optional) {
      throw new ArgumentError('argument type mismatch', {
        argData
      })
    }

    if (usedType) {
      const parsedValue = await types[usedType].parse(msg, value)
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
