const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const cmd = require('./commands');
const db = require('./firebase');

const token = process.env.token || require('./token.json').token;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ status: 'online', game: { name: 'game' } });
});

client.login(token);

client.on('message', msg => {
    console.log(msg.content);
    /*
    if (msg.content === 'ping') {
      msg.reply('pong');
    } */
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;

    const args = msg.content.slice(config.prefix.length).split(/ +/); //regex
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            cmd.ping(msg);
            break;
        case 'eval':
            cmd.eval(msg, config.prefix.length);
            break;
        case 'args-info':
            cmd.args_info(msg, command, args);
            break;
        case 'help':
            cmd.help(msg, new Discord.RichEmbed());
            break;
        case 'beep':
            cmd.beep(msg);
            break;
    }
});

// web server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));