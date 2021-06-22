const MsgQuery = require('../structures/MsgQuery')
const getPrefix = require('../modules/getPrefix')
const ClientError = require('../structures/ClientError')

const logger = require('../modules/logger')('event:onMessage')

async function onMessage (client, msg) {
  if (msg.author.bot || !msg.content) return

  logger.verbose('checking prefix')
  const { prefix, mentionPrefix } = await checkPrefix(msg)

  if (typeof prefix !== 'string' && !prefix) return

  logger.debug(`calledByMention = ${String(mentionPrefix)}`)
  logger.debug(`prefix = ${prefix}`)

  // Log
  let logString
  if (msg.guild) logString = `${msg.guild.name} > ${msg.channel.name} > ${msg.author.tag} (${msg.member.nickname}) > ${msg.content}`
  else logString = `DM ${msg.channel.recipient.tag} > ${msg.author.tag} > ${msg.content}`
  logger.chat(logString)

  const query = new MsgQuery(msg.content, prefix, mentionPrefix)
  query.calledByMention = mentionPrefix
  if (mentionPrefix && query.cmd.length < 1) query.cmd = 'hello' // HelloCommand
  logger.debug('query = %O', query)

  const cmd = client.commands.get(query.cmd)
  if (cmd) {
    if (!client.onlineMode && !client.config.owner.includes(msg.author.id)) return msg.reply(client.locale.t('error.maintenance', 'ko_KR'))
    else client.commands.run(cmd, client, msg, query)
  }
}

async function checkPrefix (msg) {
  const client = msg.client
  const mentionRegex = /^(<@!?\d{17,19}>)/

  // mention prefix
  const mentionPrefixData = mentionRegex.exec(msg.content)
  if (mentionPrefixData) {
    return {
      prefix: mentionPrefixData[1],
      mentionPrefix: true
    }
  }

  // DM channel
  if (!msg.guild) {
    return {
      prefix: '',
      mentionPrefix: false
    }
  }

  let prefix
  try {
    prefix = await getPrefix(client, msg.guild.id)
  } catch (err) {
    const e = new ClientError(err)
    e.report()
  }

  if (msg.content.startsWith(prefix)) {
    return {
      prefix,
      mentionPrefix: false
    }
  }
  else return {}
}

module.exports = onMessage
