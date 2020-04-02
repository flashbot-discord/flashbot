/**
 * @name bot.js
 * @description Main Bot Script
 */

/* eslint-disable no-unused-vars */
const VERSION = 'v0.8'
const BUILD_DATE = '2020/3/27'
/* eslint-enable no-unused-vars */

// import needed modules
const path = require('path')

const BotClient = require('./classes/BotClient')
const CommandHandler = require('./classes/CommandHandler')
const LocaleHandler = require('./classes/LocaleHandler')

const onReadyEvent = require('./events/onReady')
const onMessageEvent = require('./events/onMessage')

/**
 * Main Client
 * @type {BotClient}
 */
const client = new BotClient()

/**
 * Database
 */
/*
switch (config.db.type) {
  case 'json': {
    let req = require('./db/json');
    var db = new req('./db/db.json');
    client.setProvider(db);
    break
  }
  case 'mysql': {
    let provider = require('./db/mysql')
    let db = new provider(config.db.connection)
    client.setProvider(db)
    break
  }
}
*/
client.setupDatabase()

// Setup Locale (i18n)
client.registerLocaleHandler(new LocaleHandler(client))

/*
client.getGuildLocale = async (guild) => {
  let locale = await client.provider.get('guilds', guild.id, 'lang') || 'en';
  return locale.length > 0 ? locale[0].lang : 'en'
};
*/

// event
client.registerEvent('ready', onReadyEvent)
client.registerEvent('message', onMessageEvent)

// Login to Discord
client.start()

// Commando: Register Defaults
/*
client.registry
  .registerDefaults()
  .registerGroups([
    ['dev', 'Commands for developing'],
    ['misc', 'Misc'],
    ['info', 'Provides several informations'],
    ['activation', 'activating/deactivating the bot on the server'],
    ['memo', 'memo']
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'));
*/
client.registerCommandHandler(new CommandHandler(client, path.resolve() + '/commands'))

// for debug purposes
client.on('message', msg => {
  if (msg.guild) {
    console.log(`${msg.guild.name} > ${msg.channel.name} > ${msg.author.username} (${msg.webhookID ? 'null' : msg.member.nickname}) > ${msg.content}`)
  } else {
    console.log(`DM (${msg.channel.id}) > ${msg.author.username} > ${msg.content}`)
  }
})

// web server (Heroku web dyno placeholder)
const express = require('express')
const app = express()
/**
 * web server port
 * @type {number}
 */
const PORT = process.env.PORT || 5000

app.use(express.static('public'))
app.listen(PORT, () => console.log(`Web server on port ${PORT}`))
