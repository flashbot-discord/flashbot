const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const clientId = ''
const guildId = ''
const { token } = require('../token.json')

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Pong!')
].map(cmd => cmd.toJSON())

const rest = new REST({ version: 9 }).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered commands'))
  .catch(console.error)
