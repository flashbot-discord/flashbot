const minimist = require('minimist')

const Command = require('./base')
const types = require('../types/index')

class ArgumentCollector {
  constructor (parentCommand) {
    this._command = parentCommand
    this.args = { named: {}, unnamed: [] }
  }

  registerNamedArgument (argInfo) {
    /*
    name: string (throws Error if not provided): {
      aliases: Array<string> ([]),
      type: string|Array<string> ('any'),
      optional: boolean (false),
      default: any (undefined)
    }
    */
  }

  registerUnnamedArguments (argInfosArr) {
    /*
    {
      key: string (throws Error if not provided),
      type: string|Array<string> (null),
      optional: boolean (false),
      default: any (undefined)
    }
    */

    for (const argInfo of argInfosArr) {
      // name
      const key = String(argInfo.key)
      if (key.length < 1) throw new Error('Argument name is empty')
      else if (this.args.unnamed.some(a => a.key === key)) throw new Error('Argument name already exists')

      // type
      if (typeof argInfo.type === 'string') {
        if (types[argInfo.type] == null) throw new TypeError('Invalid argument type')
      } else if (Array.isArray(argInfo.type)) {
        if (!argInfo.type.every(type => types[type] != null)) throw new TypeError('Invalid argument type')
      } else if (argInfo.type == null) argInfo.type = null
      else throw new TypeError('Argument type must be string or Array<string> or null')
                                                              // optional field
      const optional = Boolean(argInfo.optional)

      this.args.unnamed.push({
        key,
        type: argInfo.type,
        optional,
        default: argInfo.default
      })
    }
  }

  parseArguments (rawArgs) {
    console.log(this.args)
    const useNamedArgs = Object.keys(this.args.named).length > 0

    if (useNamedArgs) return this._parseNamedArgs(rawArgs)
    else return this._parseUnnamedArgs(rawArgs)

    /*
    for (const argName in this.args.named) {
      const arg = this.args.named[argName]
      if (arg.type === 'boolean') booleanTypedArgs.push(argName)
      else if (arg.type === 'string') stringTypedArgs.push(argName)

      if (arg.aliases) aliases[argName] = arg.aliases
    }
    this.args.unnamed
      .forEach(arg => {
      if (arg.type === 'boolean') booleanTypedArgs.push(arg.name)
      else if (arg.type === 'string') stringTypedArgs.push(arg.name)

      if (arg.aliases) aliases[arg.name] = arg.aliases
    })
console.log(booleanTypedArgs, stringTypedArgs, aliases)
    const parsedArgs = useNamedArgs ? minimist(rawArgs, {
        boolean: booleanTypedArgs,
        string: stringTypedArgs,
        alias: aliases
      }) : rawArgs
console.log(parsedArgs)
    // Check
    for (const argName in parsedArgs) {
      const parsedArg = parsedArgs[argName]
      if (argName === '_') {
        parsedArg.forEach((arg, idx) => {
          const argData = this.args.unnamed[idx]

          if (!argData) return
          else if (!types[argData.type].validate(arg)) throw new Error('Argument type mismatch')

          parsedArgs[argData.key] = types[argData.type].parse(arg)
        })
      } else {
        const argData = this.args.named[argName]

        if (!argData) continue
        else if (!types[argData.type].validate(parsedArg)) throw new Error('Argument type mismatch')
      
        parsedArgs[argName] = types[argData.type].parse(parsedArg)
      }
    }

    parsedArgs._.forEach(arg => {
      
    })
console.log(parsedArgs) 
    return parsedArgs
    */
  }

  _parseNamedArgs (argsArr) {
    const booleanTypedArgs = []
    const stringTypedArgs = []
    const aliases = {}

    for (argName in this.args.named) {
      const arg = this.args.named[argName]

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
      if (argName === '_') {
        Object.assign(finalArgs, this._parseUnnamedArgs(arg))
      } else {
        const argData = this.args.named[argName]

        if (!argData) continue

        const usedType = this._validateArg(arg, argData.type)
        if (!usedType) throw new Error('Argument type mismatch')
      
        finalArgs[argName] = types[usedType].parse(arg)
      }
    }

    return finalArgs
  }

  _parseUnnamedArgs (argsArr) {
    const parsedArgs = {}
console.log(argsArr)
    argsArr.forEach((arg, idx) => {
      const argData = this.args.unnamed[idx]
      if (!argData) return

      const usedType = this._validateArg(arg, argData.type)
      if (!usedType) throw new Error('Argument type mismatch')

      parsedArgs[argData.key] = types[usedType].parse(arg)
    })

    return parsedArgs
  }

  _validateArg (arg, type) {
    if (Array.isArray(type)) {
      const usedType = type.find(t => types[t].validate(arg))
      return usedType != null ? usedType : null
    } else {
      return types[type].validate(arg) ? type : null
    }
  }

  has (name) {
    return name in this.args.named ||
      this.args.unnamed.some(el => el.key === name)
  }
}

module.exports = ArgumentCollector
