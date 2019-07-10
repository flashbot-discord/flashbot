/**
 * @name bot.js
 * @description Main Bot Script
 */

const config = require('./config.json');

const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const client = new Commando.Client({
    owner: config.owner,
    commandPrefix: config.prefix,
    unknownCommandResponse: false
});

const db = require('./firebase');

const i18n = require('i18n');
i18n.configure({
    directory: './lang',
    objectNotation: true
});

const token = process.env.token || require('./token.json').token;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setPresence({ status: 'online', game: { name: `${config.prefix}help` } });
});

client.login(token);

client.registry
    .registerDefaults()
    .registerGroups([
        ['dev', 'Commands for developing'],
        ['misc', 'Misc']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

// web server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));