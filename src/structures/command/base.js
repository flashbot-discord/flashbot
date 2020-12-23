const ArgumentCollector = require('./arguments')

class Command {
  constructor (client, infos) {
    this._logPos = 'Command'
    this._client = client

    /**
     * the name of a command
     * 명령어 이름
     * @type {string}
     */
    this._name = infos.name

    /**
     * the description of a command
     * 명령어 설명
     * @type {string}
     */
    this._desc = infos.description || `commands.${infos.name}.DESC`

    /**
     * whether the description needs to be translated
     * 명령어 설명을 변역해야 하는지 여부
     * @type {boolean}
     */
    this._descNeedsTranslate = !!infos.description

    /**
     * the aliases of a command
     * 명령어 별칭
     * @type {Array<string>}
     */
    this._aliases = infos.aliases || []

    /**
     * required client(bot) permissions to run this command
     * 봇이 이 명령어를 실행하는 데 필요한 권한
     * @type {Array<string>}
     */
    this._clientPerms = infos.clientPerms || []

    /**
     * required user permissions(command executor) to run this command
     * 사용자가 이 명령어를 실행할 때 필요한 유저 권한
     * @type {Array<string>}
     */
    this._userPerms = infos.userPerms || []

    /**
     * whether the command can only be used by bot owner
     * 봇 소유자 전용 명령어 여부
     * @type {boolean}
     */
    this._owner = infos.owner || false

    /**
     * whether the command can only be used in a server text channel
     * 서버 전용 명령어 여부
     * @type {boolean}
     */
    this._guildOnly = infos.guildOnly || false

    /**
     * whether the command can only be used in activated server
     * 봇을 활성화한 서버에서만 이 명령어 사용 가능 여부
     * @type {boolean}
     */
    this._guildAct = infos.guildAct || false

    /**
     * whether the command can only be used by registered user
     * 등록한 이용자만 이 명령어 사용 가능 여부
     * @type {boolean}
     */
    this._userReg = infos.userReg || false

    /**
     * whether the command can be used when DB enabled
     * DB가 활성화되었을 때만 명령어 사용 가능 여부
     * @type {boolean}
     */
    this._requireDB = infos.requireDB || false

    /**
     * the command arguments
     * 명령어에서 사용하는 인수들
     * @type {ArgumentCollector}
     */
    this._args = new ArgumentCollector(this)

    /**
     * command group which includes this command
     * 이 명령어가 속해 있는 명령어 그룹
     * @type {string}
     */
    this._group = infos.group || ''

    /**
     * absolute path of command file
     * 명령어 파일의 절대경로
     * @type {string}
     */
    this._path = ''

    /**
     * whether the command is enabled
     * 명령어 활성화 여부
     * @type {boolean}
     */
    this._enabled = true

    // Add default value to args
    if (
      infos.args != null &&
      typeof infos.args === 'object' &&
      !Array.isArray(infos.args)
    ) {
      for (const arg in infos.args) {
        if (arg === '_') this._args.registerUnnamedArguments(infos.args[arg])
        else this._args.registerNamedArgument(arg, infos.args[arg])
      }
    } else if (Array.isArray(infos.args) && infos.args.length > 0) {
      this._args.registerUnnamedArguments(infos.args)
    }
  }

  async run (_client, _msg, _args, _locale) {
    throw new Error('run() method not provided')
  }

  reload () {
    const logPos = this._logPos + '.reload'

    this._client.logger.log(logPos, "Reloading command '" + this._name + "'")
    const cmdPath = this._path
    delete require.cache[cmdPath]
    const newCmd = require(cmdPath)
    this._client.logger.debug(logPos, "Deleted command cache for '" + this._name + "'")

    this._client.commands.reregister(this, newCmd)
    this._client.logger.log(logPos, "Reloaded command '" + this._name + "'")
  }

  unload () {
    delete require.cache[this._path]
    this._client.commands.unregister(this)
  }

  static async pleaseRegisterUser (cmd, msg, locale) {
    // TODO
  }

  static async pleaseActivateGuild (cmd, msg, locale) {
    return await msg.reply(cmd._client.locale.t('Command.pleaseRegister.guild', locale, cmd._client.config.prefix))
  }

  static makeUsage (cmd, called, t) {
    let str = ''
    cmd._args.forEach((arg) => {
      const name = t(arg.name)
      const type = t(arg.type)

      str = str + (arg.optional ? '[' : '(') + name + ': ' + type + (arg.optional ? ']' : ')') + ' '
    })
    str += '\n\n'
    cmd._args.forEach((arg) => {
      const name = t(arg.name)
      const desc = t(arg.description)
      str = str + (arg.optional ? '[' : '(') + name + (arg.optional ? ']' : ')') + ' - ' + desc + ' ' + '\n'
    })

    return t('Command.makeUsage.str', cmd._client.config.prefix, called, str)
  }

  _translateDesc (t) {
    return this._descNeedsTranslate ? t(this._desc) : this._desc
  }

  /*
  _validateArgs (rawArgs) {
    const argsParseOpts = { aliases: {}, default: {} }
    if (!Array.isArray(this._args) && typeof this._args === 'object') {
      for (const arg in this._args) {
        if (arg === '_') continue

        const argData = this._args[arg]
        if (Array.isArray(argData.aliases) && argData.aliases.length > 0) argsParseOpts.alias[arg] = argData.aliases
        if (argData.default != null) argsParseOpts.default[arg] = argData.default
      }
    }

    const inputArgs = minimist(rawArgs, argsParseOpts)

    let passed = true
    if (Array.isArray(this._args)) {
      this._args.forEach((cmdArg, idx) => {
        if (!passed) return

        // Is the type correct?
        if (!argTypes[cmdArg.type].validate(inputArgs[idx])) {
          passed = false
          return
        }

        // Is required argument exist?
        if (!cmdArg.optional && cmdArg.type !== 'boolean' && !inputArgs[idx]) {
          passed = false
          return
        }


      })
    }
  }
  */
}

module.exports = Command
